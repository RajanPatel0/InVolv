import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    // Notification Content
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    icon: String, // Icon name or emoji
    link: String, // Link to navigate when clicked

    // Notification Metadata
    notificationType: {
        type: String,
        enum: ["INTENT_CREATED", "PRICE_DROP", "STOCK_CHANGE", "RESERVE_EXPIRY", "ALERT", "MANUAL", "RESERVATION_APPROVED", "RESERVATION_REJECTED"],
        default: "MANUAL",
    },
    
    // Related data
    intentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserIntent",
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },

    // FCM Metadata
    fcmToken: String, // Token to which this notification was sent
    fcmMessageId: String, // Response ID from FCM
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    readAt: Date,

}, { timestamps: true, indexes: [
    { userId: 1, isRead: 1, createdAt: -1 }, // For getting unread notifications
] });

// Pre-save middleware to set readAt when marking as read
notificationSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();

  // Normalize update object
  if (update.isRead === true) {
    update.readAt = new Date();
    this.setUpdate(update);
  } else if (update.$set && update.$set.isRead === true) {
    update.$set.readAt = new Date();
  }

  next;
});

export default mongoose.model("Notification", notificationSchema);