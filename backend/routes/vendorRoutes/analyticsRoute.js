import express from "express";
import { authMiddleware } from "../../middlewares/vendorMiddlewares/authMiddleware.js";
import VendorInsight from "../../models/StoreModels/vendorInsightModel.js";
import { getRealTimeMetrics, getComparisonMetrics, persistMetricsToDatabase } from "../../utils/realTimeAnalytics.js";
import { getConversionFunnel, getHourlyFunnel, getProductConversionFunnel } from "../../utils/conversionFunnelAnalytics.js";
import { getInventoryRecommendations, getCategoryInventoryAnalysis, predictStockOutDates } from "../../utils/inventoryOptimization.js";

const router = express.Router();

// ============================================================
// NEW ENDPOINTS - PRODUCTION FEATURES
// ============================================================

router.post("/test/persist", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();
    await persistMetricsToDatabase(vendorId);
    res.json({ success: true, message: `Persisted for ${vendorId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 1. REAL-TIME DASHBOARD
 * GET /api/vendor/analytics/realtime
 * Shows: Today's live data (searches, clicks, intents) - Updated every 5 minutes
 */
router.get("/realtime", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();

    const realtimeData = await getRealTimeMetrics(vendorId);

    if (!realtimeData) {
      return res.status(404).json({
        success: false,
        message: "No real-time data available. Data will start collecting with live events."
      });
    }

    res.json({
      success: true,
      data: {
        metrics: realtimeData.metrics,
        uniqueUsers: realtimeData.uniqueUsers,
        conversions: realtimeData.conversions,
        hourlyBreakdown: realtimeData.hourlyBreakdown,
        lastUpdated: new Date(),
        note: "Data updates every time users interact (search, click, reserve). Persisted to DB hourly."
      }
    });
  } catch (err) {
    console.error("Error in realtime endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. COMPARISON ANALYTICS
 * GET /api/vendor/analytics/compare?period=day|week|month
 * Shows: Day-over-day, week-over-week, month-over-month growth %
 * Example: "Your searches up 23% vs last week"
 */
router.get("/compare", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();
    const period = req.query.period || "week"; // day, week, month

    if (!["day", "week", "month"].includes(period)) {
      return res.status(400).json({
        success: false,
        error: "Invalid period. Use: day, week, or month"
      });
    }

    const comparison = await getComparisonMetrics(vendorId, period);

    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: "Insufficient data for comparison"
      });
    }

    res.json({
      success: true,
      data: {
        period,
        current: comparison.current,
        previous: comparison.previous,
        growth: {
          searches: {
            value: comparison.growth.searches,
            status: comparison.growth.searches > 0 ? "up" : "down",
            message: `Searches ${comparison.growth.searches > 0 ? "↑" : "↓"} ${Math.abs(comparison.growth.searches)}% vs ${period}`
          },
          clicks: {
            value: comparison.growth.clicks,
            status: comparison.growth.clicks > 0 ? "up" : "down",
            message: `Clicks ${comparison.growth.clicks > 0 ? "↑" : "↓"} ${Math.abs(comparison.growth.clicks)}% vs ${period}`
          },
          reserves: {
            value: comparison.growth.reserves,
            status: comparison.growth.reserves > 0 ? "up" : "down",
            message: `Reservations ${comparison.growth.reserves > 0 ? "↑" : "↓"} ${Math.abs(comparison.growth.reserves)}% vs ${period}`
          }
        }
      }
    });
  } catch (err) {
    console.error("Error in compare endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. CONVERSION FUNNEL
 * GET /api/vendor/analytics/funnel?dateRange=today|week|month
 * Shows: Searches → Views → Reserves conversion at each step
 * Shows: Drop-off percentage
 */
router.get("/funnel", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();
    const dateRange = req.query.dateRange || "week"; // today, week, month

    if (!["today", "week", "month"].includes(dateRange)) {
      return res.status(400).json({
        success: false,
        error: "Invalid dateRange. Use: today, week, or month"
      });
    }

    const funnel = await getConversionFunnel(vendorId, dateRange);

    res.json({
      success: true,
      data: {
        period: dateRange,
        startDate: funnel.startDate,
        endDate: funnel.endDate,
        funnel: funnel.funnel,
        summary: funnel.summary,
        insights: funnel.insights
      }
    });
  } catch (err) {
    console.error("Error in funnel endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Conversion Funnel - Hourly Breakdown
 * GET /api/vendor/analytics/funnel/hourly?dateRange=week
 */
router.get("/funnel/hourly", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();
    const dateRange = req.query.dateRange || "week";

    const hourlyFunnel = await getHourlyFunnel(vendorId, dateRange);

    res.json({
      success: true,
      data: hourlyFunnel
    });
  } catch (err) {
    console.error("Error in hourly funnel endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Conversion Funnel - Product Level
 * GET /api/vendor/analytics/funnel/products?dateRange=week
 * See which products convert best
 */
router.get("/funnel/products", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();
    const dateRange = req.query.dateRange || "week";

    const productFunnel = await getProductConversionFunnel(vendorId, dateRange);

    res.json({
      success: true,
      data: productFunnel
    });
  } catch (err) {
    console.error("Error in product funnel endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. INVENTORY OPTIMIZATION
 * GET /api/vendor/analytics/inventory/recommendations
 * Shows: Products to restock (high demand, low stock)
 * Shows: Products to reduce (low demand, high stock)
 * Shows: Predicted stock-out dates
 */
router.get("/inventory/recommendations", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();

    const recommendations = await getInventoryRecommendations(vendorId);

    res.json({
      success: true,
      data: {
        restock: recommendations.restock,
        reduce: recommendations.reduce,
        optimal: recommendations.optimal,
        atRisk: recommendations.atRisk,
        summary: recommendations.summary,
        insights: recommendations.insights
      }
    });
  } catch (err) {
    console.error("Error in inventory endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Inventory - Category Analysis
 * GET /api/vendor/analytics/inventory/category
 */
router.get("/inventory/category", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();

    const categoryAnalysis = await getCategoryInventoryAnalysis(vendorId);

    res.json({
      success: true,
      data: categoryAnalysis
    });
  } catch (err) {
    console.error("Error in category analysis endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Inventory - Stock-out Predictions
 * GET /api/vendor/analytics/inventory/stockout-predictions
 */
router.get("/inventory/stockout-predictions", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor._id.toString();

    const predictions = await predictStockOutDates(vendorId);

    res.json({
      success: true,
      data: predictions,
      count: predictions.length
    });
  } catch (err) {
    console.error("Error in stockout predictions endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// LEGACY ENDPOINTS (kept for backward compatibility)
// ============================================================

// Temporary – for manual triggering
import { runDailyAnalytics } from "../../utils/analyticsJob.js";
router.get("/test/manual-aggregation", async (req, res) => {
  try {
    await runDailyAnalytics();
    res.json({ success: true, message: "Aggregation job completed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vendor/analytics/dashboard — today's summary
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const vId = req.vendor._id;

    // Get last available insight (yesterday or whenever last ran)
    const latest = await VendorInsight.findOne({ vendorId: vId }).sort({ date: -1 });
    if (!latest) return res.json({ success: true, data: null, message: "No data yet — check back after midnight" });

    // Also get 7-day trend
    const week = await VendorInsight.find({ vendorId: vId }).sort({ date: -1 }).limit(7);
    const dailyTrend = week.reverse().map(r => ({
      date: r.date,
      views: r.totals.views,
      reservations: r.totals.reservations,
    }));

    res.json({
      success: true,
      data: {
        totals:          latest.totals,
        topProducts:     latest.topProducts.slice(0, 10),
        forecast:        latest.forecast,
        dailyTrend,
        lastUpdated:     latest.date,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vendor/analytics/trending?days=7
router.get("/trending", authMiddleware, async (req, res) => {
  try {
    const vId = req.vendor._id;
    const days = parseInt(req.query.days) || 7;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const insights = await VendorInsight.find({ vendorId: vId, date: { $gte: since } });

    // Aggregate product scores across all days
    const map = {};
    insights.forEach(insight => {
      insight.topProducts.forEach(p => {
        const key = p.productId.toString();
        if (!map[key]) map[key] = { ...p.toObject?.() || p, days: 0 };
        map[key].demandScore  += p.demandScore;
        map[key].reservations += p.reservations;
        map[key].viewCount    += p.viewCount;
        map[key].days++;
      });
    });

    const trending = Object.values(map).sort((a, b) => b.demandScore - a.demandScore).slice(0, 15);

    res.json({ success: true, data: trending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;