import Notification from "../../models/UserModels/notificationModel.js";;

export const getNotifications = async(req, res)=>{
    const notification = await Notification.find({
        userId: req.user._id,
    }).sort({ createdAt: -1})
      .limit(30)
      .lean();

    res.json({
        success: true,
        message: "Notifications fetched successfully",
        notification,
    });
}

export const markAsRead = async (req, res)=>{
    await Notification.findOneAndUpdate({
        _id: req.params.id,
        userId: req.user._id,
    },{
        isRead: true
    });

    res.json({
        success: true,
        message: "Notification marked as read",
    });
}

export const unreadCount = async(req, res)=>{
    const count = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false,
    });

    res.json({
        success: true,
        count,
    });
}

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true });
};
