import express from "express";

import { 
    getNotifications, 
    markAsRead, 
    unreadCount, 
    markAllAsRead,
    registerFCMToken,
    deleteNotification,
    clearAllNotifications,
    testFCMNotification,
} from "../../controllers/userControllers/notificationController.js";
import { userAuthMiddleware} from "../../middlewares/userMiddlewares/userAuthMiddleware.js";

const router = express.Router();

// FCM Token Management
router.post("/fcm-token", userAuthMiddleware, registerFCMToken);
router.post("/fcm-test", userAuthMiddleware, testFCMNotification);

// Notifications Fetching
router.get("/notifications", userAuthMiddleware, getNotifications);
router.get("/unreadCount", userAuthMiddleware, unreadCount);

// Notification Updates
router.post("/markRead/:id", userAuthMiddleware, markAsRead);
router.post("/markAllRead", userAuthMiddleware, markAllAsRead);
router.delete("/delete/:id", userAuthMiddleware, deleteNotification);
router.post("/clearAll", userAuthMiddleware, clearAllNotifications);

export default router;