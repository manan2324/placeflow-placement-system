import api from "@/lib/axios";

export const notificationService = {
  /**
   * Fetch notifications for the current user
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum notifications to fetch
   * @param {number} params.skip - Number of notifications to skip
   * @returns {Promise<Object>} Notification data with unread count
   */
  async getNotifications({ limit = 20, skip = 0 } = {}) {
    const response = await api.get("/student/notifications", {
      params: { limit, skip },
    });
    return response.data;
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - ID of the notification
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    const response = await api.patch(
      `/student/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Result of the operation
   */
  async markAllAsRead() {
    const response = await api.patch("/student/notifications/mark-all-read");
    return response.data;
  },
};
