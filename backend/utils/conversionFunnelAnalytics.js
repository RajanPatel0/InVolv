import AnalyticsMetrics from "../models/StoreModels/analyticsMetricsModel.js";
import UserIntent from "../models/UserModels/userIntentModel.js";
import mongoose from "mongoose";

/**
 * CONVERSION FUNNEL ANALYTICS
 * Tracks user journey: Search → View → Reserve
 * Calculates drop-off at each stage
 */

export const getConversionFunnel = async (vendorId, dateRange) => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);

    // Query metrics from database
    const metricsRecords = await AnalyticsMetrics.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (!metricsRecords || metricsRecords.length === 0) {
      return {
        period: dateRange,
        startDate,
        endDate,
        funnel: [
          { stage: "searches", count: 0, percentage: 100 },
          { stage: "clicks", count: 0, percentage: 0, dropoff: 0 },
          { stage: "reserves", count: 0, percentage: 0, dropoff: 0 }
        ],
        summary: {
          totalSearches: 0,
          totalClicks: 0,
          totalReserves: 0,
          searchToClickRate: 0,
          clickToReserveRate: 0,
          searchToReserveRate: 0,
        }
      };
    }

    // Aggregate metrics across all days
    const totalSearches = metricsRecords.reduce((sum, m) => sum + (m.metrics?.searches || 0), 0);
    const totalClicks = metricsRecords.reduce((sum, m) => sum + (m.metrics?.productClicks || 0), 0);
    const totalReserves = metricsRecords.reduce((sum, m) => sum + (m.metrics?.reserves || 0), 0);

    // Calculate conversion rates
    const searchToClickRate = totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0;
    const clickToReserveRate = totalClicks > 0 ? (totalReserves / totalClicks) * 100 : 0;
    const searchToReserveRate = totalSearches > 0 ? (totalReserves / totalSearches) * 100 : 0;

    const funnel = [
      {
        stage: "searches",
        label: "Total Searches",
        count: totalSearches,
        percentage: 100,
        dropoff: 0
      },
      {
        stage: "clicks",
        label: "Product Views/Clicks",
        count: totalClicks,
        percentage: totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0,
        dropoff: totalSearches > 0 ? ((totalSearches - totalClicks) / totalSearches) * 100 : 0,
        conversionRate: searchToClickRate.toFixed(2)
      },
      {
        stage: "reserves",
        label: "Reservations",
        count: totalReserves,
        percentage: totalSearches > 0 ? (totalReserves / totalSearches) * 100 : 0,
        dropoff: totalClicks > 0 ? ((totalClicks - totalReserves) / totalClicks) * 100 : 0,
        conversionRate: clickToReserveRate.toFixed(2)
      }
    ];

    return {
      period: dateRange,
      startDate,
      endDate,
      funnel,
      summary: {
        totalSearches,
        totalClicks,
        totalReserves,
        avgDaysInPeriod: metricsRecords.length,
        searchToClickRate: searchToClickRate.toFixed(2),
        clickToReserveRate: clickToReserveRate.toFixed(2),
        searchToReserveRate: searchToReserveRate.toFixed(2),
      },
      insights: generateFunnelInsights(totalSearches, totalClicks, totalReserves)
    };
  } catch (err) {
    console.error(`[Analytics] Error getting conversion funnel:`, err);
    throw err;
  }
};

/**
 * Get hourly funnel breakdown for detailed analysis
 */
export const getHourlyFunnel = async (vendorId, dateRange) => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);

    const metricsRecords = await AnalyticsMetrics.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      date: { $gte: startDate, $lte: endDate }
    });

    // Aggregate hourly data
    const hourlyAggregation = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyAggregation[hour] = { searches: 0, clicks: 0, reserves: 0 };
    }

    metricsRecords.forEach(metrics => {
      if (metrics.hourlyBreakdown) {
        metrics.hourlyBreakdown.forEach(hourData => {
          if (!hourlyAggregation[hourData.hour]) {
            hourlyAggregation[hourData.hour] = { searches: 0, clicks: 0, reserves: 0 };
          }
          hourlyAggregation[hourData.hour].searches += hourData.searches || 0;
          hourlyAggregation[hourData.hour].clicks += hourData.clicks || 0;
          hourlyAggregation[hourData.hour].reserves += hourData.reserves || 0;
        });
      }
    });

    // Calculate conversion rates per hour
    const hourlyFunnel = Object.entries(hourlyAggregation).map(([hour, data]) => {
      const searches = data.searches || 0;
      const clicks = data.clicks || 0;
      const reserves = data.reserves || 0;

      return {
        hour: parseInt(hour),
        timeLabel: `${hour.padStart(2, '0')}:00`,
        searches,
        clicks,
        reserves,
        conversionRates: {
          searchToClick: searches > 0 ? ((clicks / searches) * 100).toFixed(2) : 0,
          clickToReserve: clicks > 0 ? ((reserves / clicks) * 100).toFixed(2) : 0,
          searchToReserve: searches > 0 ? ((reserves / searches) * 100).toFixed(2) : 0,
        }
      };
    });

    return hourlyFunnel;
  } catch (err) {
    console.error(`[Analytics] Error getting hourly funnel:`, err);
    throw err;
  }
};

/**
 * Get product-level conversion funnel
 * Which products convert best?
 */
export const getProductConversionFunnel = async (vendorId, dateRange) => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);

    const metricsRecords = await AnalyticsMetrics.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      date: { $gte: startDate, $lte: endDate }
    });

    // Aggregate product-level metrics
    const productMap = {};

    metricsRecords.forEach(metrics => {
      if (metrics.productMetrics) {
        metrics.productMetrics.forEach(pm => {
          const key = pm.productId.toString();
          if (!productMap[key]) {
            productMap[key] = {
              productId: pm.productId,
              pdtName: pm.pdtName,
              searches: 0,
              views: 0,
              reserves: 0,
            };
          }
          productMap[key].searches += pm.searches || 0;
          productMap[key].views += pm.views || 0;
          productMap[key].reserves += pm.reserves || 0;
        });
      }
    });

    // Calculate conversion rates and rank
    const productFunnels = Object.values(productMap)
      .map(product => {
        return {
          productId: product.productId,
          pdtName: product.pdtName,
          funnel: {
            searches: product.searches,
            views: product.views,
            reserves: product.reserves,
          },
          conversions: {
            searchToView: product.searches > 0 ? ((product.views / product.searches) * 100).toFixed(2) : 0,
            viewToReserve: product.views > 0 ? ((product.reserves / product.views) * 100).toFixed(2) : 0,
            searchToReserve: product.searches > 0 ? ((product.reserves / product.searches) * 100).toFixed(2) : 0,
          }
        };
      })
      .sort((a, b) => {
        // Sort by conversion rate (most converting products first)
        return parseFloat(b.conversions.searchToReserve) - parseFloat(a.conversions.searchToReserve);
      })
      .slice(0, 20); // Top 20 products

    return productFunnels;
  } catch (err) {
    console.error(`[Analytics] Error getting product funnel:`, err);
    throw err;
  }
};

// Helper functions

function getDateRange(dateRange) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  let startDate = new Date();

  if (dateRange === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (dateRange === "week") {
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (dateRange === "month") {
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}

function generateFunnelInsights(searches, clicks, reserves) {
  const insights = [];

  const searchToClickRate = searches > 0 ? (clicks / searches) * 100 : 0;
  const clickToReserveRate = clicks > 0 ? (reserves / clicks) * 100 : 0;

  // Provide actionable insights
  if (searchToClickRate < 20) {
    insights.push({
      level: "warning",
      message: "Low search-to-click rate",
      suggestion: "Only 20% of searchers are viewing your products. Consider improving product visibility or descriptions."
    });
  }

  if (clickToReserveRate < 15) {
    insights.push({
      level: "warning",
      message: "Low click-to-reserve conversion",
      suggestion: "Customers are viewing products but not reserving. Check pricing, stock availability, or reservation flow."
    });
  }

  if (searchToClickRate > 40) {
    insights.push({
      level: "info",
      message: "High search engagement",
      suggestion: "Great! Your products attract interest. Focus on converting clicks to reservations."
    });
  }

  if (clicks === 0 && searches > 0) {
    insights.push({
      level: "warning",
      message: "No product clicks recorded",
      suggestion: "Searches are happening but users aren't viewing your products. Verify product listings are visible."
    });
  }

  return insights;
}

export default {
  getConversionFunnel,
  getHourlyFunnel,
  getProductConversionFunnel,
};
