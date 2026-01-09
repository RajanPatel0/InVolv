import redis from "../../config/redis.js";

export const invalidateSearchCache = async () => {
  if (!redis) return; // ✅ Redis disabled → do nothing

  try {
    const keys = await redis.keys("search:*");
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error("Redis cache invalidation failed:", err.message);
  }
};

export const invalidateTrendingCache = async () => {
  if (!redis) return; // ✅ Redis disabled → do nothing

  try {
    await redis.del("trending:products");
  } catch (err) {
    console.error("Trending cache invalidation failed:", err.message);
  }
};
