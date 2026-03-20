import api from "../axios.js";
import {
  requestNotificationPermission,
  setupFCMMessageListener,
} from "../../firebase/firebase.js";

let fcmInitialized = false;

/**
 * Initialize FCM for the application
 * - Register service worker
 * - Request notification permission
 * - Get FCM token
 * - Set up message listeners
 * - Register token with backend
 */
export const initializeFCM = async () => {
  if (fcmInitialized) {
    console.log("⚠️  FCM already initialized");
    return;
  }

  try {
    // Check if user is logged in BEFORE making any API calls
    const user = localStorage.getItem("user");
    if (!user || user.trim().length === 0) {
      console.log("❌ User not logged in, skipping FCM initialization");
      return;
    }

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.log("❌ Service Workers not supported in this browser");
      return;
    }

    // Register service worker
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker registered:", registration);
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }

    // Request notification permission and get FCM token
    const fcmToken = await requestNotificationPermission();

    if (fcmToken) {
      // Save token to backend - ONLY if user is logged in
      try {
        await api.post("/userInvolv/fcm-token", { fcmToken });
        console.log("✅ FCM token registered with backend");
        localStorage.setItem("fcmToken", fcmToken);
      } catch (error) {
        console.error("Error registering FCM token with backend:", error);
      }
    }

    // Set up message listener for foreground notifications
    setupFCMMessageListener((payload) => {
      console.log("📨 Foreground notification received:", payload);

      // Dispatch custom event that components can listen to
      const event = new CustomEvent("fcmMessageReceived", {
        detail: payload,
      });
      window.dispatchEvent(event);

      // Also emit to Zustand store if available
      try {
        const { addNotification } = require("../stores/notificationStore.js").default.getState();
        addNotification({
          _id: payload.data?.intentId || Date.now(),
          title: payload.notification?.title || "New Notification",
          message: payload.notification?.body || "",
          icon: payload.notification?.icon,
          isRead: false,
          createdAt: new Date(),
          notificationType: payload.data?.notificationType,
          link: payload.data?.link,
        });
      } catch (error) {
        console.log("Notification store not available yet, skipping");
      }
    });

    fcmInitialized = true;
    console.log("✅ FCM initialized successfully");
  } catch (error) {
    console.error("❌ FCM initialization error:", error);
  }
};

/**
 * Check if FCM is initialized
 */
export const isFCMInitialized = () => fcmInitialized;

/**
 * Get stored FCM token
 */
export const getStoredFCMToken = () => {
  return localStorage.getItem("fcmToken");
};

export default {
  initializeFCM,
  isFCMInitialized,
  getStoredFCMToken,
};
