import Notification from "@/models/Notification";

export async function createNotification(notificationData, { session } = {}) {
  if (session) {
    const [created] = await Notification.create([notificationData], { session });
    return created;
  }
  return Notification.create(notificationData);
}

export async function listRecentNotificationsByUser(userId, { limit = 5, session } = {}) {
  const q = Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  if (session) q.session(session);
  return q;
}

export async function getNotificationsByUser(userId, { limit = 20, skip = 0, session } = {}) {
  const q = Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
  if (session) q.session(session);
  return q;
}

export async function getUnreadCount(userId, { session } = {}) {
  const q = Notification.countDocuments({ userId, isRead: false });
  if (session) q.session(session);
  return q;
}

export async function markNotificationAsRead(notificationId, userId, { session } = {}) {
  const q = Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (session) q.session(session);
  return q;
}

export async function markAllNotificationsAsRead(userId, { session } = {}) {
  const q = Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  if (session) q.session(session);
  return q;
}

export async function deleteNotification(notificationId, userId, { session } = {}) {
  const q = Notification.findOneAndDelete({ _id: notificationId, userId });
  if (session) q.session(session);
  return q;
}
