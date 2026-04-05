import Product from "../models/StoreModels/productModel.js";
import AnalyticsMetrics from "../models/StoreModels/analyticsMetricsModel.js";
import PriceHistory from "../models/StoreModels/priceHistoryModel.js";
import mongoose from "mongoose";

/**
 * INVENTORY OPTIMIZATION RECOMMENDATIONS
 * Predicts stock needs based on demand trends
 * Shows what to restock, what to reduce, and when stock runs out
 */

export const getInventoryRecommendations = async (vendorId) => {
  try {
    // Get all products for this vendor
    const products = await Product.find({ vendorId: new mongoose.Types.ObjectId(vendorId) })
      .select("_id pdtName price stock category");

    if (!products || products.length === 0) {
      return {
        restock: [],
        reduce: [],
        optimal: [],
        insights: [
          {
            level: "info",
            message: "No products found",
            suggestion: "Add products to get inventory recommendations."
          }
        ]
      };
    }

    // Get last 30 days of analytics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await AnalyticsMetrics.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Aggregate demand metrics for each product
    const productDemand = {};
    analytics.forEach(metric => {
      if (metric.productMetrics) {
        metric.productMetrics.forEach(pm => {
          const key = pm.productId.toString();
          if (!productDemand[key]) {
            productDemand[key] = {
              pdtName: pm.pdtName,
              totalSearches: 0,
              totalViews: 0,
              totalReserves: 0,
              avgDaily: {
                searches: 0,
                views: 0,
                reserves: 0
              }
            };
          }
          productDemand[key].totalSearches += pm.searches || 0;
          productDemand[key].totalViews += pm.views || 0;
          productDemand[key].totalReserves += pm.reserves || 0;
        });
      }
    });

    // Calculate averages
    const daysWithData = analytics.length || 1;
    Object.values(productDemand).forEach(demand => {
      demand.avgDaily.searches = Math.ceil(demand.totalSearches / daysWithData);
      demand.avgDaily.views = Math.ceil(demand.totalViews / daysWithData);
      demand.avgDaily.reserves = Math.ceil(demand.totalReserves / daysWithData);
    });

    // Analyze each product
    const recommendations = {
      restock: [],
      reduce: [],
      optimal: [],
      atRisk: []
    };

    for (const product of products) {
      const demandData = productDemand[product._id.toString()] || {
        avgDaily: { searches: 0, views: 0, reserves: 0 },
        totalReserves: 0
      };

      const analysis = analyzeProductInventory(product, demandData, daysWithData);

      if (analysis.recommendation === "RESTOCK") {
        recommendations.restock.push(analysis);
      } else if (analysis.recommendation === "REDUCE") {
        recommendations.reduce.push(analysis);
      } else if (analysis.recommendation === "OPTIMAL") {
        recommendations.optimal.push(analysis);
      }

      if (analysis.stockOutRisk > 0) {
        recommendations.atRisk.push(analysis);
      }
    }

    // Sort by priority
    recommendations.restock.sort((a, b) => b.priority - a.priority);
    recommendations.reduce.sort((a, b) => b.priority - a.priority);
    recommendations.atRisk.sort((a, b) => a.daysToStockOut - b.daysToStockOut);

    return {
      restock: recommendations.restock.slice(0, 15),
      reduce: recommendations.reduce.slice(0, 15),
      optimal: recommendations.optimal.slice(0, 10),
      atRisk: recommendations.atRisk.slice(0, 10),
      summary: {
        totalProducts: products.length,
        needsRestock: recommendations.restock.length,
        shouldReduce: recommendations.reduce.length,
        atOptimal: recommendations.optimal.length,
        atStockOutRisk: recommendations.atRisk.length
      },
      insights: generateInventoryInsights(recommendations)
    };
  } catch (err) {
    console.error(`[Analytics] Error getting inventory recommendations:`, err);
    throw err;
  }
};

/**
 * Get category-level inventory analysis
 */
export const getCategoryInventoryAnalysis = async (vendorId) => {
  try {
    const products = await Product.find({ vendorId: new mongoose.Types.ObjectId(vendorId) })
      .select("pdtName category stock price");

    const categoryAnalysis = {};

    products.forEach(product => {
      if (!categoryAnalysis[product.category]) {
        categoryAnalysis[product.category] = {
          category: product.category,
          products: [],
          totalStock: 0,
          avgStock: 0,
          lowStockCount: 0
        };
      }

      categoryAnalysis[product.category].products.push({
        pdtName: product.pdtName,
        stock: product.stock,
        price: product.price
      });
      categoryAnalysis[product.category].totalStock += product.stock;

      if (product.stock < 3) {
        categoryAnalysis[product.category].lowStockCount += 1;
      }
    });

    // Calculate averages
    Object.values(categoryAnalysis).forEach(cat => {
      cat.avgStock = (cat.totalStock / cat.products.length).toFixed(1);
    });

    return Object.values(categoryAnalysis).sort((a, b) => b.lowStockCount - a.lowStockCount);
  } catch (err) {
    console.error(`[Analytics] Error getting category analysis:`, err);
    throw err;
  }
};

/**
 * Predict stock-out dates based on sales velocity
 */
export const predictStockOutDates = async (vendorId) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const priceHistory = await PriceHistory.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      recordedAt: { $gte: ninetyDaysAgo }
    }).sort({ recordedAt: 1 });

    // Group by product
    const productHistory = {};
    priceHistory.forEach(history => {
      const key = history.productId.toString();
      if (!productHistory[key]) {
        productHistory[key] = [];
      }
      productHistory[key].push({
        date: history.recordedAt,
        stock: history.stock,
        price: history.price
      });
    });

    // Calculate stock-out predictions
    const predictions = [];

    for (const [productId, history] of Object.entries(productHistory)) {
      if (history.length < 7) continue; // Need at least 7 data points

      // Calculate average daily stock decrease
      const stockChanges = [];
      for (let i = 1; i < history.length; i++) {
        const change = history[i - 1].stock - history[i].stock;
        if (change > 0) {
          stockChanges.push(change);
        }
      }

      if (stockChanges.length === 0) continue;

      const avgDailyDecrease = stockChanges.reduce((a, b) => a + b, 0) / stockChanges.length;
      const currentStock = history[history.length - 1].stock;
      const daysToStockOut = avgDailyDecrease > 0 ? Math.ceil(currentStock / avgDailyDecrease) : null;

      if (daysToStockOut && daysToStockOut <= 30 && daysToStockOut > 0) {
        const stockOutDate = new Date();
        stockOutDate.setDate(stockOutDate.getDate() + daysToStockOut);

        predictions.push({
          productId: new mongoose.Types.ObjectId(productId),
          currentStock,
          avgDailyDecrease: avgDailyDecrease.toFixed(2),
          daysToStockOut,
          predictedStockOutDate: stockOutDate,
          urgency: daysToStockOut <= 7 ? "critical" : daysToStockOut <= 14 ? "high" : "medium"
        });
      }
    }

    return predictions.sort((a, b) => a.daysToStockOut - b.daysToStockOut);
  } catch (err) {
    console.error(`[Analytics] Error predicting stock-out:`, err);
    throw err;
  }
};

// Helper functions

function analyzeProductInventory(product, demandData, daysAnalyzed) {
  const avgDailyReserves = demandData.avgDaily.reserves;
  const avgDailySearches = demandData.avgDaily.searches;
  const totalReserves = demandData.totalReserves;
  const currentStock = product.stock;

  // Calculate recommendation and metrics
  let recommendation = "OPTIMAL";
  let priority = 0;
  let reason = "";
  let suggestedStock = 0;
  let stockOutRisk = 0;
  let daysToStockOut = null;

  // Demand scoring
  const demandScore = avgDailyReserves * 0.5 + avgDailySearches * 0.3;

  if (currentStock === 0 && demandScore > 2) {
    // Stock-out + high demand
    recommendation = "RESTOCK";
    priority = 100;
    reason = "Out of stock with high demand";
    suggestedStock = Math.ceil(avgDailyReserves * 7); // 1 week supply
    stockOutRisk = 100;
    daysToStockOut = 0;
  } else if (currentStock < 3 && demandScore > 3) {
    // Very low stock + high demand
    recommendation = "RESTOCK";
    priority = 90;
    reason = "Critical stock - high demand";
    suggestedStock = Math.ceil(avgDailyReserves * 7);
    stockOutRisk = 80;
    if (avgDailyReserves > 0) {
      daysToStockOut = Math.ceil(currentStock / avgDailyReserves);
    }
  } else if (currentStock < 5 && demandScore > 2) {
    // Low stock + moderate demand
    recommendation = "RESTOCK";
    priority = 70;
    reason = "Low stock with moderate demand";
    suggestedStock = Math.ceil(avgDailyReserves * 10);
    stockOutRisk = 40;
    if (avgDailyReserves > 0) {
      daysToStockOut = Math.ceil(currentStock / avgDailyReserves);
    }
  } else if (currentStock > 50 && demandScore < 1) {
    // High stock + low demand
    recommendation = "REDUCE";
    priority = 60;
    reason = "Excess inventory with low demand";
    suggestedStock = Math.ceil(avgDailyReserves * 3);
  } else if (currentStock > 30 && avgDailyReserves === 0) {
    // Stock but no movement
    recommendation = "REDUCE";
    priority = 50;
    reason = "Slow-moving inventory";
    suggestedStock = 5;
  } else if (currentStock >= 5 && currentStock <= 30 && demandScore > 0) {
    // Balanced
    recommendation = "OPTIMAL";
    priority = 0;
    reason = "Inventory is well-balanced";
    suggestedStock = currentStock;
  } else {
    recommendation = "OPTIMAL";
    priority = 0;
    reason = "Stock level is appropriate";
    suggestedStock = currentStock;
  }

  return {
    productId: product._id,
    pdtName: product.pdtName,
    category: product.category,
    currentStock,
    suggestedStock: Math.max(suggestedStock, 0),
    recommendation,
    priority,
    reason,
    demand: {
      avgDailySearches: avgDailySearches.toFixed(1),
      avgDailyReserves: avgDailyReserves.toFixed(1),
      demandScore: demandScore.toFixed(2)
    },
    metrics: {
      daysAnalyzed,
      totalReserves,
      movement: ((totalReserves / daysAnalyzed) * 100).toFixed(1) // Movement velocity %
    },
    stockOutRisk,
    daysToStockOut,
    price: product.price,
    potentialRevenueLoss: ((suggestedStock - currentStock) * product.price).toFixed(2)
  };
}

function generateInventoryInsights(recommendations) {
  const insights = [];

  if (recommendations.restock.length > 5) {
    insights.push({
      level: "warning",
      message: "Multiple products need restocking",
      suggestion: `${recommendations.restock.length} products have low stock. Consider bulk ordering to get better rates.`
    });
  }

  if (recommendations.reduce.length > 3) {
    insights.push({
      level: "info",
      message: "Excess inventory detected",
      suggestion: `${recommendations.reduce.length} products are overstocked. Consider running a promotion to clear inventory.`
    });
  }

  if (recommendations.atRisk.length > 0) {
    const critical = recommendations.atRisk.filter(p => p.urgency === "critical");
    if (critical.length > 0) {
      insights.push({
        level: "error",
        message: "Critical stock-out risk",
        suggestion: `${critical.length} products at critical stock levels. Reorder immediately to avoid lost sales.`
      });
    }
  }

  if (recommendations.optimal.length / recommendations.restock.length > 2) {
    insights.push({
      level: "success",
      message: "Good inventory management",
      suggestion: "Most products are well-stocked. Keep monitoring demand trends."
    });
  }

  return insights;
}

export default {
  getInventoryRecommendations,
  getCategoryInventoryAnalysis,
  predictStockOutDates,
};
