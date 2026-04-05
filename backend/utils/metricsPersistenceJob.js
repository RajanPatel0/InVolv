import cron from "node-cron";
import Vendor from "../models/StoreModels/vendorModel.js";
import { persistMetricsToDatabase } from "./realTimeAnalytics.js";

/**
 * METRICS PERSISTENCE JOB
 * Runs every hour to persist real-time Redis metrics to MongoDB
 * This ensures we have historical data for analysis and recovery if Redis goes down
 */

export const startMetricsPersistenceJob = () => {
  // Run every hour at minute 0
  // * = every minute/hour, 0 = at minute 0 of every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[MetricsPersistence] Starting hourly metrics persistence job...");

    try {
      // Get all vendors
      const vendors = await Vendor.find({}).select("_id");

      if (!vendors || vendors.length === 0) {
        console.log("[MetricsPersistence] No vendors found");
        return;
      }

      // Persist metrics for each vendor
      const results = await Promise.allSettled(
        vendors.map(vendor => persistMetricsToDatabase(vendor._id.toString()))
      );

      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      console.log(
        `[MetricsPersistence] Completed: ${succeeded}/${vendors.length} vendors processed, ${failed} failed`
      );

      if (failed > 0) {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `[MetricsPersistence] Error for vendor ${vendors[index]._id}:`,
              result.reason
            );
          }
        });
      }
    } catch (err) {
      console.error("[MetricsPersistence] Job error:", err);
    }
  });

  console.log("[MetricsPersistence] Job scheduled: Every hour at minute 0");
};

export default { startMetricsPersistenceJob };
