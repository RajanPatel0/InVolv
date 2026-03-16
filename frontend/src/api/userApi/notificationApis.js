import api from "../axios.js";

export const getNotifications = async (page = 1, limit = 30) => {
  const response = await api.get("/userInvolv/notifications", {
    params: { page, limit },
    withCredentials: true,
  });
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.post(
    `/userInvolv/markRead/${notificationId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post(
    "/userInvolv/markAllRead",
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get("/userInvolv/unreadCount", {
    withCredentials: true,
  });
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(
    `/userInvolv/delete/${notificationId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const clearAllNotifications = async () => {
  const response = await api.post(
    "/userInvolv/clearAll",
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const testNotification = async () => {
  const response = await api.post(
    "/userInvolv/fcm-test",
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};
