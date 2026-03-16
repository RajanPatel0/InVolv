import React, { useEffect, useState } from "react";
import { X, Trash2, CheckCheck, Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useNotificationStore from "../../../api/stores/notificationStore.js";

const NotificationPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
  } = useNotificationStore();

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLocalLoading(true);
    try {
      await Promise.all([fetchNotifications(1), fetchUnreadCount()]);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, isRead) => {
    try {
      if (!isRead) {
        await markAsRead(notificationId);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
    handleMarkAsRead(notification._id, notification.isRead);
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      INTENT_CREATED: "🎉",
      PRICE_DROP: "📉",
      STOCK_CHANGE: "📊",
      RESERVE_EXPIRY: "⏰",
      MANUAL: "📢",
    };
    return iconMap[type] || "📬";
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 sticky top-0 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Notification Panel */}
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 400 }}
        transition={{ duration: 0.3 }}
        className={`
          fixed top-0 right-0 h-screen w-full md:w-96 bg-gradient-to-b 
          from-slate-900 to-slate-950 border-l border-slate-700/50 
          shadow-2xl z-[200] flex flex-col overflow-hidden
          ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700/50 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="px-4 py-3 bg-slate-800/30 flex gap-2 border-b border-slate-700/50">
            <button
              onClick={() => markAllAsRead()}
              className="flex-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              <CheckCheck size={16} />
              Mark All Read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {localLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
              <Bell className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-center">No notifications yet</p>
              <p className="text-xs text-slate-500 mt-2">
                You'll see notifications about your intents here
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    group p-3 rounded-lg border transition-all cursor-pointer
                    ${
                      notification.isRead
                        ? "bg-slate-900/50 border-slate-700/30 hover:bg-slate-800/50"
                        : "bg-slate-800/80 border-emerald-500/30 hover:bg-slate-800"
                    }
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.notificationType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white text-sm leading-tight">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 w-2 h-2 bg-emerald-400 rounded-full mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {notification.link && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          className="p-1.5 hover:bg-slate-700/50 rounded transition"
                          title="Open"
                        >
                          <ArrowRight size={14} className="text-slate-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="p-1.5 hover:bg-red-500/20 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/30 text-center">
            <p className="text-xs text-slate-500">
              {unreadCount === 0
                ? "All caught up! ✨"
                : `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`}
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
};

/**
 * Format time for display
 */
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

export default NotificationPopup;
