import Notification from "../../models/UserModels/notificationModel.js";;
import { updateUserFCMToken, sendTestFCMNotification } from "../../utils/fcmService.js";

/**
 * Register or update FCM token for a user
 */
export const registerFCMToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    // Update FCM token in database
    await updateUserFCMToken(userId, fcmToken);

    res.json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error) {
    console.error("Register FCM Token Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register FCM token",
      error: error.message,
    });
  }
};

/**
 * Get all notifications for a user
 */
export const getNotifications = async(req, res)=>{
    try {
        const { page = 1, limit = 30 } = req.query;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({
                userId: req.user._id,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Notification.countDocuments({
                userId: req.user._id,
            })
        ]);

        res.json({
            success: true,
            message: "Notifications fetched successfully",
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req, res)=>{
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id,
            },
            {
                isRead: true,
                readAt: new Date(),
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        console.error("Mark As Read Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};

/**
 * Get unread notification count
 */
export const unreadCount = async(req, res)=>{
    try {
        const count = await Notification.countDocuments({
            userId: req.user._id,
            isRead: false,
        });

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Unread Count Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get unread count",
        });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { 
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ 
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      userId: req.user._id,
    });

    res.json({
      success: true,
      message: "All notifications cleared successfully",
    });
  } catch (error) {
    console.error("Clear All Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};

/**
 * Test FCM notification (development only)
 */
export const testFCMNotification = async (req, res) => {
  try {
    // Get user's FCM token
    const user = await require("../../models/UserModels/userModel.js").default.findById(req.user._id);
    
    if (!user?.fcmToken) {
      return res.status(400).json({
        success: false,
        message: "No FCM token found for user",
      });
    }

    // Send test notification
    const messageId = await sendTestFCMNotification(user.fcmToken);

    res.json({
      success: true,
      message: "Test notification sent successfully",
      messageId,
    });
  } catch (error) {
    console.error("Test FCM Notification Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error.message,
    });
  }
};
