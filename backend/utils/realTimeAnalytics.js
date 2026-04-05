import redis from "../config/redis.js";
import AnalyticsMetrics from "../models/StoreModels/analyticsMetricsModel.js";
import mongoose from "mongoose";

const REDIS_PREFIX = "analytics:";
const CACHE_TTL = 86400; // 24 hours

// ✅ Helper: Get today as YYYY-MM-DD string
function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ Helper: Get anonymous user ID from request
export function getAnonymousUserId(req) {
  // Try multiple sources for a stable identifier
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.socket?.remoteAddress ||
         req.connection?.remoteAddress ||
         'anonymous';
}

/**
 * Track a search event (works for both logged-in & anonymous users)
 */
export const trackSearch = async (vendorId, userId, productName) => {
  try {
    const today = getToday();
    const hour = new Date().getHours();

    const metricsKey = `${REDIS_PREFIX}${vendorId}:${today}:metrics`;
    const hourlyKey = `${REDIS_PREFIX}${vendorId}:${today}:hourly:${hour}`;
    const usersKey = `${REDIS_PREFIX}${vendorId}:${today}:users:searched`;

    if (redis) {
      // ✅ Use HINCRBY for hash fields
      await redis.hincrby(metricsKey, 'searches', 1);
      await redis.hincrby(hourlyKey, 'searches', 1);
      await redis.sadd(usersKey, userId.toString());
      
      // Set expiry
      await redis.expire(metricsKey, CACHE_TTL);
      await redis.expire(hourlyKey, CACHE_TTL);
      await redis.expire(usersKey, CACHE_TTL);
    }
    console.log(`[Analytics] Search tracked: vendor=${vendorId}, user=${userId}`);
  } catch (err) {
    console.error(`[Analytics] Error tracking search:`, err);
  }
};

/**
 * Track product click (works for anonymous)
 */
export const trackProductClick = async (vendorId, userId, productId, pdtName) => {
  try {
    const today = getToday();
    const hour = new Date().getHours();

    const metricsKey = `${REDIS_PREFIX}${vendorId}:${today}:metrics`;
    const hourlyKey = `${REDIS_PREFIX}${vendorId}:${today}:hourly:${hour}`;
    const productKey = `${REDIS_PREFIX}${vendorId}:${today}:product:${productId}`;
    const usersKey = `${REDIS_PREFIX}${vendorId}:${today}:users:viewed`;

    if (redis) {
      await redis.hincrby(metricsKey, 'clicks', 1);
      await redis.hincrby(hourlyKey, 'clicks', 1);
      await redis.hincrby(productKey, 'views', 1);
      await redis.sadd(usersKey, userId.toString());
      await redis.hset(`${productKey}:data`, 'name', pdtName);

      await Promise.all([
        redis.expire(metricsKey, CACHE_TTL),
        redis.expire(hourlyKey, CACHE_TTL),
        redis.expire(productKey, CACHE_TTL),
        redis.expire(usersKey, CACHE_TTL),
      ]);
    }
    console.log(`[Analytics] Click tracked: vendor=${vendorId}, product=${productId}`);
  } catch (err) {
    console.error(`[Analytics] Error tracking click:`, err);
  }
};

/**
 * Track reservation (requires login – userId is real)
 */
export const trackReservation = async (vendorId, userId, productId, pdtName) => {
  try {
    const today = getToday();
    const hour = new Date().getHours();

    const metricsKey = `${REDIS_PREFIX}${vendorId}:${today}:metrics`;
    const hourlyKey = `${REDIS_PREFIX}${vendorId}:${today}:hourly:${hour}`;
    const productKey = `${REDIS_PREFIX}${vendorId}:${today}:product:${productId}`;
    const usersKey = `${REDIS_PREFIX}${vendorId}:${today}:users:reserved`;

    if (redis) {
      await redis.hincrby(metricsKey, 'reserves', 1);
      await redis.hincrby(hourlyKey, 'reserves', 1);
      await redis.hincrby(productKey, 'reserves', 1);
      await redis.sadd(usersKey, userId.toString());

      await Promise.all([
        redis.expire(metricsKey, CACHE_TTL),
        redis.expire(hourlyKey, CACHE_TTL),
        redis.expire(productKey, CACHE_TTL),
        redis.expire(usersKey, CACHE_TTL),
      ]);
    }
    console.log(`[Analytics] Reservation tracked: vendor=${vendorId}`);
  } catch (err) {
    console.error(`[Analytics] Error tracking reservation:`, err);
  }
};

/**
 * Track alert creation (requires login)
 */
export const trackAlertCreated = async (vendorId, userId, alertType) => {
  try {
    const today = getToday();
    const metricsKey = `${REDIS_PREFIX}${vendorId}:${today}:metrics`;

    if (redis) {
      const field = alertType === "PRICE_DROP" ? 'priceAlerts' : 'stockAlerts';
      await redis.hincrby(metricsKey, field, 1);
      await redis.expire(metricsKey, CACHE_TTL);
    }
  } catch (err) {
    console.error(`[Analytics] Error tracking alert:`, err);
  }
};

/**
 * Get real-time metrics from Redis (reads hash)
 */
export const getRealTimeMetrics = async (vendorId) => {
  try {
    const today = getToday();
    const metricsKey = `${REDIS_PREFIX}${vendorId}:${today}:metrics`;

    if (!redis) return null;

    // ✅ Now metricsKey is a hash with fields: searches, clicks, reserves, etc.
    const metricsData = await redis.hgetall(metricsKey);
    
    // Get hourly breakdown
    const hourlyData = [];
    for (let i = 0; i < 24; i++) {
      const hourKey = `${REDIS_PREFIX}${vendorId}:${today}:hourly:${i}`;
      const hourMetrics = await redis.hgetall(hourKey);
      hourlyData.push({
        hour: i,
        searches: parseInt(hourMetrics.searches || 0),
        clicks: parseInt(hourMetrics.clicks || 0),
        reserves: parseInt(hourMetrics.reserves || 0),
      });
    }

    const [searchedUsers, viewedUsers, reservedUsers] = await Promise.all([
      redis.scard(`${REDIS_PREFIX}${vendorId}:${today}:users:searched`),
      redis.scard(`${REDIS_PREFIX}${vendorId}:${today}:users:viewed`),
      redis.scard(`${REDIS_PREFIX}${vendorId}:${today}:users:reserved`),
    ]);

    const searches = parseInt(metricsData.searches || 0);
    const clicks = parseInt(metricsData.clicks || 0);
    const reserves = parseInt(metricsData.reserves || 0);

    return {
      metrics: {
        searches,
        clicks,
        reserves,
        priceAlerts: parseInt(metricsData.priceAlerts || 0),
        stockAlerts: parseInt(metricsData.stockAlerts || 0),
      },
      uniqueUsers: {
        searched: searchedUsers,
        viewed: viewedUsers,
        reserved: reservedUsers,
      },
      conversions: {
        searchToView: searches > 0 ? ((clicks / searches) * 100).toFixed(2) : 0,
        viewToReserve: clicks > 0 ? ((reserves / clicks) * 100).toFixed(2) : 0,
        searchToReserve: searches > 0 ? ((reserves / searches) * 100).toFixed(2) : 0,
      },
      hourlyBreakdown: hourlyData,
    };
  } catch (err) {
    console.error(`[Analytics] Error getting real-time metrics:`, err);
    return null;
  }
};

/**
 * Get comparison metrics (unchanged, works with DB)
 */
export const getComparisonMetrics = async (vendorId, period) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStart, previousStart;
    if (period === "day") {
      currentStart = new Date();
      currentStart.setHours(0, 0, 0, 0);
      previousStart = new Date();
      previousStart.setDate(previousStart.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      currentStart = getWeekStart(new Date());
      previousStart = getWeekStart(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      currentStart = getMonthStart(new Date());
      previousStart = getMonthStart(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
    }

    const [currentMetrics, previousMetrics] = await Promise.all([
      AnalyticsMetrics.findOne({
        vendorId,
        date: { $gte: currentStart, $lt: new Date(currentStart.getTime() + 24 * 60 * 60 * 1000) }
      }),
      AnalyticsMetrics.findOne({
        vendorId,
        date: { $gte: previousStart, $lt: new Date(previousStart.getTime() + 24 * 60 * 60 * 1000) }
      }),
    ]);

    const current = currentMetrics?.metrics || { searches: 0, productClicks: 0, reserves: 0 };
    const previous = previousMetrics?.metrics || { searches: 0, productClicks: 0, reserves: 0 };

    return {
      period,
      current,
      previous,
      growth: {
        searches: calculateGrowth(current.searches, previous.searches),
        clicks: calculateGrowth(current.productClicks, previous.productClicks),
        reserves: calculateGrowth(current.reserves, previous.reserves),
      },
    };
  } catch (err) {
    console.error(`[Analytics] Error getting comparison metrics:`, err);
    return null;
  }
};

/**
 * Persist metrics to DB (updated for hash structure)
 */
export const persistMetricsToDatabase = async (vendorId) => {
  try {
    const today = getToday();
    if (!redis) return;

    const metricsKey = `${REDIS_PREFIX}${vendorId}:${today}:metrics`;
    const metricsData = await redis.hgetall(metricsKey);
    if (!metricsData || Object.keys(metricsData).length === 0) return;

    // Get hourly breakdown
    const hourlyBreakdown = [];
    for (let i = 0; i < 24; i++) {
      const hourKey = `${REDIS_PREFIX}${vendorId}:${today}:hourly:${i}`;
      const hourMetrics = await redis.hgetall(hourKey);
      if (Object.keys(hourMetrics).length > 0) {
        hourlyBreakdown.push({
          hour: i,
          searches: parseInt(hourMetrics.searches || 0),
          clicks: parseInt(hourMetrics.clicks || 0),
          reserves: parseInt(hourMetrics.reserves || 0),
        });
      }
    }

    // Get unique users from Redis sets
    const [searchedUsers, viewedUsers, reservedUsers] = await Promise.all([
      redis.smembers(`${REDIS_PREFIX}${vendorId}:${today}:users:searched`),
      redis.smembers(`${REDIS_PREFIX}${vendorId}:${today}:users:viewed`),
      redis.smembers(`${REDIS_PREFIX}${vendorId}:${today}:users:reserved`),
    ]);

    // Helper: only keep valid 24-char hex strings (real user IDs)
    const toObjectIdSafe = (id) => {
      if (!id || typeof id !== 'string') return null;
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        return new mongoose.Types.ObjectId(id);
      }
      return null; // skip anonymous IDs
    };

    const searches = parseInt(metricsData.searches || 0);
    const clicks = parseInt(metricsData.clicks || 0);
    const reserves = parseInt(metricsData.reserves || 0);

    const calculated = {
      searchToViewConversion: searches > 0 ? (clicks / searches) * 100 : 0,
      viewToReserveConversion: clicks > 0 ? (reserves / clicks) * 100 : 0,
      overallConversion: searches > 0 ? (reserves / searches) * 100 : 0,
      avgProductsPerSearch: searches > 0 ? clicks / searches : 0,
      uniqueSearches: searchedUsers.filter(id => /^[0-9a-fA-F]{24}$/.test(id)).length,
      uniqueReservers: reservedUsers.filter(id => /^[0-9a-fA-F]{24}$/.test(id)).length,
    };

    await AnalyticsMetrics.findOneAndUpdate(
      { vendorId: new mongoose.Types.ObjectId(vendorId), date: new Date(today) },
      {
        $set: {
          vendorId: new mongoose.Types.ObjectId(vendorId),
          date: new Date(today),
          metrics: {
            searches,
            productClicks: clicks,
            reserves,
            priceAlerts: parseInt(metricsData.priceAlerts || 0),
            stockAlerts: parseInt(metricsData.stockAlerts || 0),
          },
          uniqueUsers: {
            searched: searchedUsers.map(toObjectIdSafe).filter(id => id !== null),
            viewed: viewedUsers.map(toObjectIdSafe).filter(id => id !== null),
            reserved: reservedUsers.map(toObjectIdSafe).filter(id => id !== null),
          },
          hourlyBreakdown,
          calculated,
          lastUpdated: new Date(),
        }
      },
      { upsert: true, new: true }
    );

    console.log(`[Analytics] Metrics persisted for vendor ${vendorId} on ${today}`);
  } catch (err) {
    console.error(`[Analytics] Error persisting metrics:`, err);
  }
};

// Helper functions (unchanged)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getMonthStart(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(2);
}

export default {
  trackSearch,
  trackProductClick,
  trackReservation,
  trackAlertCreated,
  getRealTimeMetrics,
  getComparisonMetrics,
  persistMetricsToDatabase,
  getAnonymousUserId,
};