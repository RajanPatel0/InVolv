import express from "express";

import { getNotifications, markAsRead, unreadCount, markAllAsRead} from "../../controllers/userControllers/notificationController.js";
import { userAuthMiddleware} from "../../middlewares/userMiddlewares/userAuthMiddleware.js";

const router = express.Router();

//validation cuzz of userId used in controller
router.get("/notifications", userAuthMiddleware, getNotifications);
router.post("/markRead/:id", userAuthMiddleware, markAsRead);
router.get("/unreadCount", userAuthMiddleware, unreadCount);
router.post("/markAllRead", userAuthMiddleware, markAllAsRead);

export default router;