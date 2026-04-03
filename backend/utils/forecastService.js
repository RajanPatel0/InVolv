import axios from "axios";

import redis from "../config/redis.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export const getPriceForecast = async (productId, vendorId) => {
  const cacheKey = `forecast:${productId}:${vendorId}`;

  // 1. Check Redis first
  if(redis){
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // 2. Call Python service
  const { data } = await axios.get(
    `${ML_SERVICE_URL}/forecast/${productId}/${vendorId}?days=7`,
    { timeout: 10000 }
  );

  // 3. Cache for 24 hours
  if(redis){
    await redis.setex(cacheKey, 86400, JSON.stringify(data));
  }

  return data;
};