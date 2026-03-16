import { messaging } from "../config/firebase.js";
import Notification from "../models/UserModels/notificationModel.js";
import User from "../models/UserModels/userModel.js";

/**
 * Send FCM notification to a user
 * @param {String} userId - User ID
 * @param {Object} notificationData - {title, message, icon, link, notificationType, intentId, storeId, productId}
 * @returns {Promise<Object>} - Saved notification document
 */
export const sendFCMNotification = async (userId, notificationData) => {
  try {
    // Get user and their FCM token
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      console.log(`No FCM token found for user: ${userId}`);
      return null;
    }

    const { title, message, icon, link, notificationType, intentId, storeId, productId } = notificationData;

    // Prepare FCM message
    const fcmMessage = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        link: link || "/myinvolv",
        notificationType: notificationType || "MANUAL",
        intentId: intentId?.toString() || "",
        storeId: storeId?.toString() || "",
        productId: productId?.toString() || "",
      },
      token: user.fcmToken,
    };

    // Send via FCM
    let fcmMessageId = null;
    try {
      fcmMessageId = await messaging.send(fcmMessage);
      console.log(`FCM notification sent successfully: ${fcmMessageId}`);
    } catch (fcmError) {
      console.error("FCM Send Error:", fcmError);
      // Log but don't throw - we'll still save the notification for database
    }

    // Create notification record in database
    const notification = await Notification.create({
      userId,
      title,
      message,
      icon,
      link: link || "/myinvolv",
      notificationType: notificationType || "MANUAL",
      intentId,
      storeId,
      productId,
      fcmToken: user.fcmToken,
      fcmMessageId,
    });

    return notification;
  } catch (error) {
    console.error("Send FCM Notification Error:", error);
    throw error;
  }
};

/**
 * Send FCM to multiple users
 * @param {Array<String>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data
 */
export const sendFCMToMultipleUsers = async (userIds, notificationData) => {
  const results = [];

  for (const userId of userIds) {
    try {
      const result = await sendFCMNotification(userId, notificationData);
      results.push({ userId, success: !!result, notificationId: result?._id });
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
      results.push({ userId, success: false, error: error.message });
    }
  }

  return results;
};

/**
 * Send FCM notification when an intent is created
 */
export const sendIntentCreatedNotification = async (userId, intentType, productName, storeName, storeId, productId) => {
  const messages = {
    RESERVE: `You reserved "${productName}" at "${storeName}". It will be held for 48 hours.`,
    PRICE_DROP: `You'll get notified when "${productName}" at "${storeName}" drops in price.`,
    STOCK_CHANGE: `You'll get notified when stock changes for "${productName}" at "${storeName}".`,
  };

  const icons = {
    RESERVE: "📦",
    PRICE_DROP: "📉",
    STOCK_CHANGE: "📊",
  };

  return sendFCMNotification(userId, {
    title: "Intent Created ✅",
    message: messages[intentType] || "Your intent has been created successfully",
    icon: icons[intentType],
    link: "/myinvolv",
    notificationType: "INTENT_CREATED",
    storeId,
    productId,
  });
};

/**
 * Send notification for price drop alert
 */
export const sendPriceDropNotification = async (userId, productName, oldPrice, newPrice, storeName, storeId, productId) => {
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  
  return sendFCMNotification(userId, {
    title: `Price Drop! 📉`,
    message: `"${productName}" at "${storeName}" dropped from ₹${oldPrice} to ₹${newPrice} (-${discount}%)`,
    icon: "📉",
    link: "/myinvolv",
    notificationType: "PRICE_DROP",
    storeId,
    productId,
  });
};

/**
 * Send notification for stock change alert
 */
export const sendStockChangeNotification = async (userId, productName, newStock, storeName, storeId, productId) => {
  const message = newStock > 0 
    ? `"${productName}" is back in stock at "${storeName}"!` 
    : `"${productName}" is now out of stock at "${storeName}".`;

  return sendFCMNotification(userId, {
    title: `Stock Update! 📊`,
    message,
    icon: newStock > 0 ? "✅" : "❌",
    link: "/myinvolv",
    notificationType: "STOCK_CHANGE",
    storeId,
    productId,
  });
};

/**
 * Send notification for reserve expiry
 */
export const sendReserveExpiryNotification = async (userId, productName, storeName, storeId, productId) => {
  return sendFCMNotification(userId, {
    title: `Reservation Expired ⏰`,
    message: `Your reservation for "${productName}" at "${storeName}" has expired.`,
    icon: "⏰",
    link: "/myinvolv",
    notificationType: "RESERVE_EXPIRY",
    storeId,
    productId,
  });
};

/**
 * Update user's FCM token
 */
export const updateUserFCMToken = async (userId, fcmToken) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );
    console.log(`✅ FCM token updated for user: ${userId}`);
    return user;
  } catch (error) {
    console.error("Update FCM Token Error:", error);
    throw error;
  }
};

/**
 * Test FCM setup (send a test notification)
 */
export const sendTestFCMNotification = async (fcmToken) => {
  try {
    const response = await messaging.send({
      notification: {
        title: "InVolv Test Notification 🚀",
        body: "FCM is working perfectly!",
      },
      data: {
        link: "/myinvolv",
      },
      token: fcmToken,
    });
    console.log(`✅ Test notification sent: ${response}`);
    return response;
  } catch (error) {
    console.error("Test FCM Error:", error);
    throw error;
  }
};
