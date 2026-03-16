import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  // TODO: Replace these with your Firebase config
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get messaging instance
export const messaging = getMessaging(app);

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("✅ Notification permission granted");

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log("✅ FCM Token received:", token);
        return token;
      } else {
        console.log("⚠️  No FCM token received");
        return null;
      }
    } else {
      console.log("❌ Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

/**
 * Listen to incoming FCM messages
 */
export const setupFCMMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("📨 Message received:", payload);

    // Call the callback with the message data
    if (callback) {
      callback(payload);
    }

    // Show notification if in foreground
    if (payload.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/logo.png",
        badge: "/badge.png",
        tag: payload.data?.intentId || "default",
        data: payload.data,
      });
    }
  });
};

export default app;
