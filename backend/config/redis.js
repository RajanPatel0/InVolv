import Redis from "ioredis";

let redis = null;

if (process.env.USE_REDIS === "true") {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      lazyConnect: true,              // DO NOT auto-connect
      maxRetriesPerRequest: null,     // NEVER throw retry error
      retryStrategy: () => null,      // Disable reconnect loop
      enableReadyCheck: false,
    });

    redis.on("connect", () => {
      console.log("✅ Redis Connected");
    });

    redis.on("error", (err) => {
      console.log("⚠️ Redis Error (cache disabled):", err.message);
      redis = null; // hard-disable redis
    });

    // Try connection ONCE
    redis.connect().catch(() => {
      console.log("⚠️ Redis not reachable, running WITHOUT cache");
      redis = null;
    });

  } catch (err) {
    console.log("❌ Redis init failed, cache disabled");
    redis = null;
  }
}

export default redis;
