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
