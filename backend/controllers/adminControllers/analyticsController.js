import SearchLog from "../../models/StoreModels/searchLog.js";
import redis from "../../config/redis.js";

export const getTrendingProducts = async (req, res) => {
  try {
    const cacheKey = "trending:products";

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    const trending = await SearchLog.aggregate([
      {
        $group: {
          _id: "$productName",
          searches: { $sum: 1 },
        },
      },
      { $sort: { searches: -1 } },
      { $limit: 10 },
    ]);

    await redis.setex(cacheKey, 300, JSON.stringify(trending)); // 5 min TTL

    return res.status(200).json({
      success: true,
      source: "db",
      data: trending,
    });
  } catch (err) {
    console.error("Trending error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending products",
    });
  }
};
