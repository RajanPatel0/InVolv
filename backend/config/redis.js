import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis = null;

if (process.env.USE_REDIS === "true") {
  try {
    const redisOptions = process.env.REDIS_URL
      ? process.env.REDIS_URL // Upstash / Redis Cloud
      : {
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: process.env.REDIS_PORT || 6379,
        };

    redis = new Redis(redisOptions, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy: () => null,
      enableReadyCheck: false,
      tls: {},
    });

    redis.on("connect", () => {
      console.log("✅ Redis Connected");
    });

    redis.on("error", (err) => {
      console.log("⚠️ Redis Error → cache disabled:", err.message);
      redis = null;
    });

    await redis.connect().catch(() => {
      console.log("⚠️ Redis unreachable → running without cache");
      redis = null;
    });

  } catch (err) {
    console.log("❌ Redis init failed → cache disabled");
    redis = null;
  }
}

export default redis;
