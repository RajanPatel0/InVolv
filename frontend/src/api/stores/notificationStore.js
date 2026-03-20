import { create } from "zustand";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../userApi/notificationApis.js";

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  showNotificationPanel: false,

  // Setters
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setShowNotificationPanel: (show) => set({ showNotificationPanel: show }),

  // Fetch notifications
  fetchNotifications: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getNotifications(page, 30);
      set({
        notifications: response.notifications,
        currentPage: response.pagination?.page || 1,
        totalPages: response.pagination?.pages || 1,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({
        error: error.message || "Failed to fetch notifications",
        isLoading: false,
      });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    const user = localStorage.getItem("user");
    if (!user || user.trim().length === 0) {
      console.log("⚠️ User not logged in, skipping unread count fetch");
      return;
    }
    try {
      const response = await getUnreadCount();
      set({ unreadCount: response.count });
    } catch (error) {
      // Only log if not a 401 (which means user is not authenticated)
      if (error.response?.status !== 401) {
        console.error("Error fetching unread count:", error);
      }
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await markAllNotificationsAsRead();

      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await deleteNotification(notificationId);

      set((state) => ({
        notifications: state.notifications.filter(
          (notif) => notif._id !== notificationId
        ),
      }));
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      await clearAllNotifications();
      set({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  },

  // Add new notification (from FCM)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Toggle notification panel
  toggleNotificationPanel: () => {
    set((state) => ({
      showNotificationPanel: !state.showNotificationPanel,
    }));
  },

  // Close notification panel
  closeNotificationPanel: () => {
    set({ showNotificationPanel: false });
  },

  // Open notification panel
  openNotificationPanel: () => {
    set({ showNotificationPanel: true });
  },

  // Reset store
  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      showNotificationPanel: false,
    });
  },
}));

export default useNotificationStore;
