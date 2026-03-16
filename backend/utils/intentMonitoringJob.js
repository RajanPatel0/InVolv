/**
 * Intent Monitoring Job
 * Monitors active intents and sends notifications when:
 * - Price drops below initial price
 * - Stock changes 
 * - Reservations are about to expire
 */

import UserIntent from "../models/UserModels/userIntentModel.js";
import Product from "../models/StoreModels/productModel.js";
import Vendor from "../models/StoreModels/vendorModel.js";
import {
  sendPriceDropNotification,
  sendStockChangeNotification,
  sendReserveExpiryNotification,
} from "./fcmService.js";

let isMonitoringActive = false;
let monitoringInterval = null;

/**
 * Start the intent monitoring job
 * @param {Number} intervalMs - Interval in milliseconds (default: 5 minutes)
 */
export const startIntentMonitoring = (intervalMs = 5 * 60 * 1000) => {
  if (isMonitoringActive) {
    console.log("⚠️  Intent monitoring is already active");
    return;
  }

  isMonitoringActive = true;
  console.log(`✅ Starting Intent Monitoring Job (interval: ${intervalMs}ms)`);

  // Run immediately on startup
  monitorIntents();

  // Then run periodically
  monitoringInterval = setInterval(() => {
    monitorIntents();
  }, intervalMs);
};

/**
 * Stop the intent monitoring job
 */
export const stopIntentMonitoring = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    isMonitoringActive = false;
    console.log("⏸️  Intent Monitoring Job stopped");
  }
};

/**
 * Main monitoring function
 */
export const monitorIntents = async () => {
  try {
    // 1. Check for expired reservations
    await checkExpiredReservations();

    // 2. Check for price drops
    await checkPriceDrops();

    // 3. Check for stock changes
    await checkStockChanges();
  } catch (error) {
    console.error("❌ Error in Intent Monitoring:", error);
  }
};

/**
 * Check for reservations that are about to expire or have expired
 */
async function checkExpiredReservations() {
  try {
    const now = new Date();
    const warningTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes before expiry

    // Find reservations expiring soon
    const expiringReservations = await UserIntent.find({
      intentType: "RESERVE",
      status: "ACTIVE",
      expiresAt: { $lte: warningTime, $gt: now },
      notificationSent: { $ne: true },
    }).populate("productId storeId userId");

    for (const intent of expiringReservations) {
      try {
        await sendReserveExpiryNotification(
          intent.userId._id,
          intent.productId.name,
          intent.storeId.name,
          intent.storeId._id,
          intent.productId._id
        );

        // Mark notification as sent
        intent.notificationSent = true;
        await intent.save();

        console.log(`✅ Sent expiry notification for reservation: ${intent._id}`);
      } catch (error) {
        console.error(
          `❌ Error sending expiry notification for ${intent._id}:`,
          error
        );
      }
    }

    // Delete expired reservations
    const deletedCount = await UserIntent.deleteMany({
      intentType: "RESERVE",
      status: "ACTIVE",
      expiresAt: { $lte: now },
    });

    if (deletedCount.deletedCount > 0) {
      console.log(`🗑️  Deleted ${deletedCount.deletedCount} expired reservations`);
    }
  } catch (error) {
    console.error("Error checking expired reservations:", error);
  }
}

/**
 * Check for price drops
 */
async function checkPriceDrops() {
  try {
    const priceDropIntents = await UserIntent.find({
      intentType: "PRICE_DROP",
      status: "ACTIVE",
    }).populate("productId storeId userId");

    for (const intent of priceDropIntents) {
      try {
        const product = await Product.findById(intent.productId._id);
        if (!product) continue;

        const initialPrice = intent.meta.initialPrice;
        const currentPrice = product.price;
        const lastNotifiedPrice = intent.meta.lastNotifiedPrice || initialPrice;

        // Check if price has dropped significantly (more than 5% or 10 rupees)
        const priceDropThreshold = Math.min(initialPrice * 0.05, 10);

        if (currentPrice < lastNotifiedPrice - priceDropThreshold) {
          // Send notification
          await sendPriceDropNotification(
            intent.userId._id,
            product.name,
            lastNotifiedPrice,
            currentPrice,
            intent.storeId.name,
            intent.storeId._id,
            product._id
          );

          // Update last notified price
          intent.meta.lastNotifiedPrice = currentPrice;
          await intent.save();

          console.log(
            `✅ Sent price drop notification: ${product.name} (${lastNotifiedPrice} → ${currentPrice})`
          );
        }
      } catch (error) {
        console.error(`Error checking price drop for intent ${intent._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error checking price drops:", error);
  }
}

/**
 * Check for stock changes
 */
async function checkStockChanges() {
  try {
    const stockChangeIntents = await UserIntent.find({
      intentType: "STOCK_CHANGE",
      status: "ACTIVE",
    }).populate("productId storeId userId");

    for (const intent of stockChangeIntents) {
      try {
        const product = await Product.findById(intent.productId._id);
        if (!product) continue;

        const initialStock = intent.meta.initialStock;
        const currentStock = product.stock;
        const lastNotifiedStock = intent.meta.lastNotifiedStock ?? initialStock;

        // Check if stock status has changed (from out-of-stock to in-stock or vice versa)
        const stockWasOutOfStock = lastNotifiedStock === 0;
        const stockIsNowOutOfStock = currentStock === 0;

        if (stockWasOutOfStock !== stockIsNowOutOfStock) {
          // Send notification
          await sendStockChangeNotification(
            intent.userId._id,
            product.name,
            currentStock,
            intent.storeId.name,
            intent.storeId._id,
            product._id
          );

          // Update last notified stock
          intent.meta.lastNotifiedStock = currentStock;
          await intent.save();

          console.log(
            `✅ Sent stock change notification: ${product.name} (${lastNotifiedStock} → ${currentStock})`
          );
        }
      } catch (error) {
        console.error(`Error checking stock change for intent ${intent._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error checking stock changes:", error);
  }
}

export default {
  startIntentMonitoring,
  stopIntentMonitoring,
  monitorIntents,
};
