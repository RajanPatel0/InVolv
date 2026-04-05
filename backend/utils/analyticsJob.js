import cron from "node-cron";   // npm install node-cron
import mongoose from "mongoose";
import UserIntent from "../models/UserModels/userIntentModel.js";
import SearchLog from "../models/StoreModels/searchLog.js"
import Product from "../models/StoreModels/productModel.js";
import VendorInsight from "../models/StoreModels/vendorInsightModel.js";
import Vendor from "../models/StoreModels/vendorModel.js"; // your vendor model

const runDailyAnalytics = async () => {
  console.log("[Analytics] Running daily aggregation...");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const vendors = await Vendor.find({}).select("_id");

  for (const vendor of vendors) {
    try {
      const vId = vendor._id;

      // Views for this vendor's products yesterday
      const views = await SearchLog.countDocuments({
        storeId: vId,
        createdAt: { $gte: yesterday, $lt: today },
      });

      // Reservations
      const reserves = await UserIntent.find({
        storeId: vId,
        intentType: { $in: ["PRICE_DROP", "STOCK_CHANGE", "RESERVE"] },
        createdAt: { $gte: yesterday, $lt: today },
      });

      // Unique users who interacted
      const uniqueUsers = await UserIntent.distinct("userId", {
        storeId: vId,
        createdAt: { $gte: yesterday, $lt: today },
      });

      // Per-product breakdown
      const products = await Product.find({ vendorId: vId });
      const topProducts = await Promise.all(products.map(async (p) => {
        const productViews = await UserIntent.countDocuments({
          storeId: vId, productId: p._id,
          createdAt: { $gte: yesterday, $lt: today },
        });
        const productReserves = reserves.filter(
          r => r.productId.toString() === p._id.toString()
        ).length;

        const demandScore = productViews * 0.3 + productReserves * 0.7;

        let alert = null;
        if (p.stock < 5 && demandScore > 2)  alert = "LOW_STOCK";
        else if (productReserves >= 3)         alert = "HIGH_DEMAND";
        else if (productViews >= 10)           alert = "TRENDING";

        return {
          productId:    p._id,
          pdtName:      p.pdtName,
          searchVolume: productViews, // using views as proxy for search (you can wire SearchLog too)
          viewCount:    productViews,
          reservations: productReserves,
          currentStock: p.stock,
          currentPrice: p.price,
          demandScore,
          alert,
        };
      }));

      // Sort by demand score
      topProducts.sort((a, b) => b.demandScore - a.demandScore);

      // 7-day rolling average (from last 7 VendorInsight records)
      const last7 = await VendorInsight.find({ vendorId: vId })
        .sort({ date: -1 }).limit(7);

      const avgSearches = last7.length
        ? Math.round(last7.reduce((s, r) => s + r.totals.searches, 0) / last7.length) : 0;
      const avgReserves = last7.length
        ? Math.round(last7.reduce((s, r) => s + r.totals.reservations, 0) / last7.length) : 0;

      // Auto recommendations
      const recommendations = [];
      const lowStockTrending = topProducts.filter(p => p.alert === "LOW_STOCK");
      if (lowStockTrending.length)
        recommendations.push(`Restock ${lowStockTrending[0].pdtName} — it's trending with low stock`);
      const highViews = topProducts.find(p => p.viewCount > 5 && p.reservations === 0);
      if (highViews)
        recommendations.push(`${highViews.pdtName} has high views but no reservations — consider a small price drop`);

      await VendorInsight.findOneAndUpdate(
        { vendorId: vId, date: yesterday },
        {
          vendorId: vId, date: yesterday,
          totals: { searches: views, views, reservations: reserves.length, uniqueUsers: uniqueUsers.length },
          topProducts: topProducts.slice(0, 20),
          forecast: {
            avgDailySearches:     avgSearches,
            avgDailyReservations: avgReserves,
            trendingProductIds:   topProducts.slice(0, 5).map(p => p.productId),
            recommendations,
          },
        },
        { upsert: true, new: true }
      );

    } catch (e) {
      console.error(`[Analytics] Failed for vendor ${vendor._id}:`, e.message);
    }
  }

  console.log("[Analytics] Done.");
};

// Run every day at 1:00 AM
cron.schedule("0 1 * * *", runDailyAnalytics);

// Export so you can also trigger manually (for testing)
export { runDailyAnalytics };