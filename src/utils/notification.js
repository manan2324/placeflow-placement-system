/**
 * Notification helper utilities for creating notifications across the application
 */
import { createNotification } from "@/repositories/notification.repo";

/**
 * Notification types and their default titles
 */
export const NotificationType = {
  APPLICATION_SUBMITTED: "Application Submitted",
  APPLICATION_APPROVED: "Application Approved",
  APPLICATION_REJECTED: "Application Rejected",
  APPLICATION_SHORTLISTED: "Application Shortlisted",
  PROFILE_UPDATE_APPROVED: "Profile Update Approved",
  PROFILE_UPDATE_REJECTED: "Profile Update Rejected",
  NEW_COMPANY_POSTED: "New Company Posted",
  COMPANY_DEADLINE_REMINDER: "Application Deadline Reminder",
  PLACEMENT_ACHIEVED: "Placement Achieved",
  GENERAL_ANNOUNCEMENT: "Announcement",
};

/**
 * Create a notification for a user
 * @param {string} userId - User ID to send notification to
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @param {Object} options.session - MongoDB session for transactions
 * @returns {Promise<Object>} Created notification
 */
export async function createUserNotification(
  userId,
  title,
  message,
  { session } = {}
) {
  return await createNotification(
    {
      userId,
      title,
      message,
      isRead: false,
    },
    { session }
  );
}

/**
 * Create application status notification
 * @param {string} userId - User ID
 * @param {string} companyName - Company name
 * @param {string} status - Application status
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created notification
 */
export async function notifyApplicationStatus(
  userId,
  companyName,
  status,
  { session } = {}
) {
  const statusMessages = {
    submitted: {
      title: NotificationType.APPLICATION_SUBMITTED,
      message: `Your application to ${companyName} has been successfully submitted. Good luck!`,
    },
    approved: {
      title: NotificationType.APPLICATION_APPROVED,
      message: `Congratulations! Your application to ${companyName} has been approved.`,
    },
    rejected: {
      title: NotificationType.APPLICATION_REJECTED,
      message: `Your application to ${companyName} has been rejected. Keep trying!`,
    },
    shortlisted: {
      title: NotificationType.APPLICATION_SHORTLISTED,
      message: `Great news! You've been shortlisted for ${companyName}. Check your dashboard for next steps.`,
    },
    placed: {
      title: NotificationType.PLACEMENT_ACHIEVED,
      message: `Congratulations! You've been placed at ${companyName}! 🎉`,
    },
  };

  const notification = statusMessages[status.toLowerCase()];
  if (!notification) {
    throw new Error(`Invalid application status: ${status}`);
  }

  return await createUserNotification(
    userId,
    notification.title,
    notification.message,
    { session }
  );
}

/**
 * Create profile update notification
 * @param {string} userId - User ID
 * @param {string} status - Approval status (approved/rejected)
 * @param {string} reason - Optional reason for rejection
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created notification
 */
export async function notifyProfileUpdate(
  userId,
  status,
  reason = null,
  { session } = {}
) {
  const title =
    status === "approved"
      ? NotificationType.PROFILE_UPDATE_APPROVED
      : NotificationType.PROFILE_UPDATE_REJECTED;

  const message =
    status === "approved"
      ? "Your profile update request has been approved and changes are now live."
      : `Your profile update request has been rejected. ${
          reason ? `Reason: ${reason}` : ""
        }`;

  return await createUserNotification(userId, title, message, { session });
}

/**
 * Create new company notification
 * @param {string} userId - User ID
 * @param {string} companyName - Company name
 * @param {string} deadline - Application deadline
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created notification
 */
export async function notifyNewCompany(
  userId,
  companyName,
  deadline,
  { session } = {}
) {
  const message = `New company posted: ${companyName}. Application deadline: ${deadline}. Apply now!`;

  return await createUserNotification(
    userId,
    NotificationType.NEW_COMPANY_POSTED,
    message,
    { session }
  );
}

/**
 * Create deadline reminder notification
 * @param {string} userId - User ID
 * @param {string} companyName - Company name
 * @param {string} deadline - Application deadline
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created notification
 */
export async function notifyDeadlineReminder(
  userId,
  companyName,
  deadline,
  { session } = {}
) {
  const message = `Reminder: Application deadline for ${companyName} is approaching (${deadline}). Don't miss out!`;

  return await createUserNotification(
    userId,
    NotificationType.COMPANY_DEADLINE_REMINDER,
    message,
    { session }
  );
}

/**
 * Create general announcement notification
 * @param {string} userId - User ID
 * @param {string} message - Announcement message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created notification
 */
export async function notifyAnnouncement(userId, message, { session } = {}) {
  return await createUserNotification(
    userId,
    NotificationType.GENERAL_ANNOUNCEMENT,
    message,
    { session }
  );
}

/**
 * Create notifications for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Promise<Array<Object>>} Created notifications
 */
export async function createBulkNotifications(
  userIds,
  title,
  message,
  { session } = {}
) {
  const notifications = userIds.map((userId) => ({
    userId,
    title,
    message,
    isRead: false,
  }));

  if (session) {
    return await createNotification(notifications, { session });
  }

  // For bulk operations without session, create them individually
  return await Promise.all(
    notifications.map((notif) => createNotification(notif))
  );
}
