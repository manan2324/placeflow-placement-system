# Notification Feature Documentation

## Overview

The notification feature provides real-time updates to students about various activities and actions happening in their account. Students can view notifications through a dropdown menu accessible from a bell icon in the dashboard header.

## Architecture

### Components

#### 1. **NotificationDropdown Component** (`src/components/student/NotificationDropdown.jsx`)
- Bell icon with unread count badge
- Dropdown menu with notification list
- Features:
  - Auto-refresh every 30 seconds
  - Click outside to close
  - Mark individual notifications as read
  - Mark all notifications as read
  - Shows notification timestamp (relative time)
  - Empty state when no notifications
  - Loading state
  - Visual distinction for unread notifications (blue background)

#### 2. **StudentLayout Integration** (`src/components/layouts/StudentLayout.jsx`)
- Notification icon integrated in both mobile and desktop headers
- Responsive design with proper positioning

### Backend Infrastructure

#### 1. **Database Model** (`src/models/Notification.js`)
```javascript
{
  userId: ObjectId,      // Reference to User
  title: String,         // Notification title (max 150 chars)
  message: String,       // Notification message (max 1000 chars)
  isRead: Boolean,       // Read status (default: false)
  createdAt: Date       // Auto-generated timestamp
}
```

#### 2. **Repository Layer** (`src/repositories/notification.repo.js`)
Functions:
- `createNotification(data, options)` - Create a new notification
- `getNotificationsByUser(userId, options)` - Fetch notifications with pagination
- `getUnreadCount(userId, options)` - Get count of unread notifications
- `markNotificationAsRead(notificationId, userId, options)` - Mark single as read
- `markAllNotificationsAsRead(userId, options)` - Mark all as read
- `deleteNotification(notificationId, userId, options)` - Delete a notification

#### 3. **API Endpoints**

**GET /api/student/notifications**
- Fetch notifications for authenticated user
- Query params: `limit` (default: 20), `skip` (default: 0)
- Returns: `{ notifications: [], unreadCount: number }`

**PATCH /api/student/notifications/[id]/read**
- Mark a specific notification as read
- Returns: Updated notification

**PATCH /api/student/notifications/mark-all-read**
- Mark all user's notifications as read
- Returns: Count of modified notifications

#### 4. **Service Layer** (`src/services/notification.service.js`)
Frontend service for API calls:
- `getNotifications({ limit, skip })` - Fetch notifications
- `markAsRead(notificationId)` - Mark single as read
- `markAllAsRead()` - Mark all as read

#### 5. **Utility Helpers** (`src/utils/notification.js`)
Helper functions for creating notifications:
- `createUserNotification(userId, title, message, options)`
- `notifyApplicationStatus(userId, companyName, status, options)`
- `notifyProfileUpdate(userId, status, reason, options)`
- `notifyNewCompany(userId, companyName, deadline, options)`
- `notifyDeadlineReminder(userId, companyName, deadline, options)`
- `notifyAnnouncement(userId, message, options)`
- `createBulkNotifications(userIds, title, message, options)`

## Notification Types

The system supports various notification types:

1. **APPLICATION_SUBMITTED** - When student submits an application
2. **APPLICATION_APPROVED** - When application is approved
3. **APPLICATION_REJECTED** - When application is rejected
4. **APPLICATION_SHORTLISTED** - When student is shortlisted
5. **PROFILE_UPDATE_APPROVED** - When profile update is approved
6. **PROFILE_UPDATE_REJECTED** - When profile update is rejected
7. **NEW_COMPANY_POSTED** - When a new company is posted
8. **COMPANY_DEADLINE_REMINDER** - Deadline approaching reminder
9. **PLACEMENT_ACHIEVED** - When student gets placed
10. **GENERAL_ANNOUNCEMENT** - General announcements from admin

## Usage Examples

### Creating Notifications in Application Code

```javascript
import { notifyApplicationStatus } from "@/utils/notification";

// In your application service
async function handleApplicationApproval(applicationId, userId) {
  // ... your logic ...
  
  // Send notification to student
  await notifyApplicationStatus(
    userId,
    "Microsoft",
    "approved"
  );
}
```

### Creating Custom Notifications

```javascript
import { createUserNotification } from "@/utils/notification";

await createUserNotification(
  userId,
  "Custom Title",
  "Your custom notification message here"
);
```

### Creating Bulk Notifications

```javascript
import { createBulkNotifications } from "@/utils/notification";

const studentIds = ["user1", "user2", "user3"];
await createBulkNotifications(
  studentIds,
  "Important Announcement",
  "Placement drive starts tomorrow!"
);
```

## Testing

### Using the Demo Script

A demo script is provided to create sample notifications for testing:

```bash
# Get a student's user ID from database
# Then run:
node scripts/createDemoNotifications.js <userId>
```

This will create 8 different types of notifications for testing the UI.

### Manual Testing Checklist

- [ ] Bell icon appears in student dashboard header
- [ ] Unread count badge shows correct number
- [ ] Clicking bell opens dropdown
- [ ] Clicking outside closes dropdown
- [ ] Unread notifications have blue background
- [ ] Read notifications have white background
- [ ] "Mark as read" button works for individual notifications
- [ ] "Mark all read" button works
- [ ] Timestamps show relative time (e.g., "2h ago", "1d ago")
- [ ] Empty state shows when no notifications
- [ ] Loading state shows while fetching
- [ ] Refresh button updates the list
- [ ] Dropdown auto-refreshes every 30 seconds
- [ ] Responsive design works on mobile and desktop

## Integration Points

### Existing Integrations

The notification system is already integrated with:

1. **Application Service** (`src/services/application.service.js`)
   - Sends notification when application is submitted
   - Sends notification when application status changes

2. **Dashboard Service** (`src/services/dashboard.service.js`)
   - Fetches recent notifications for dashboard display

### Adding New Notification Triggers

To add notifications to new features:

1. Import the notification helper:
```javascript
import { createUserNotification } from "@/utils/notification";
// or import specific helper
import { notifyApplicationStatus } from "@/utils/notification";
```

2. Call the notification function at the appropriate time:
```javascript
await notifyApplicationStatus(userId, companyName, "approved");
```

3. If using transactions, pass the session:
```javascript
await notifyApplicationStatus(userId, companyName, "approved", { session });
```

## Performance Considerations

1. **Auto-refresh**: Notifications auto-refresh every 30 seconds
   - Configurable in NotificationDropdown component
   - Can be adjusted based on server load

2. **Pagination**: API supports pagination
   - Default limit: 20 notifications per request
   - Can be increased for power users

3. **Indexing**: Database indexes on:
   - `userId` - For fast user-specific queries
   - `isRead` - For unread count queries

## Security

- All API endpoints require authentication via JWT token
- Users can only access their own notifications
- Notification IDs are validated before operations
- No sensitive data should be included in notification messages

## Future Enhancements

Potential improvements:
1. Real-time updates using WebSockets or Server-Sent Events
2. Notification preferences (allow users to customize what they receive)
3. Email notifications for important updates
4. Push notifications for mobile apps
5. Notification categories/filtering
6. Archive/delete notifications
7. Notification sounds
8. Desktop notifications API integration

## Troubleshooting

### Notifications not showing
- Check if user is authenticated
- Verify JWT token is valid
- Check browser console for errors
- Verify API endpoints are accessible

### Unread count not updating
- Check if auto-refresh is working (every 30s)
- Try manual refresh button
- Check network tab for API errors

### Dropdown not closing
- Check if click outside handler is working
- Inspect browser console for JavaScript errors

## API Response Examples

### GET /api/student/notifications
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "title": "Application Approved",
        "message": "Congratulations! Your application to Microsoft has been approved.",
        "isRead": false,
        "createdAt": "2026-02-07T10:30:00.000Z"
      }
    ],
    "unreadCount": 5
  }
}
```

### PATCH /api/student/notifications/[id]/read
```json
{
  "success": true,
  "data": {
    "notification": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Application Approved",
      "message": "Congratulations! Your application to Microsoft has been approved.",
      "isRead": true,
      "createdAt": "2026-02-07T10:30:00.000Z"
    }
  },
  "message": "Notification marked as read"
}
```

## File Structure

```
src/
├── app/
│   └── api/
│       └── student/
│           └── notifications/
│               ├── route.js                           # GET notifications
│               ├── [id]/
│               │   └── read/
│               │       └── route.js                   # PATCH mark as read
│               └── mark-all-read/
│                   └── route.js                       # PATCH mark all
├── components/
│   ├── student/
│   │   └── NotificationDropdown.jsx                   # Main notification UI
│   └── layouts/
│       └── StudentLayout.jsx                          # Integrated layout
├── models/
│   └── Notification.js                                # Database schema
├── repositories/
│   └── notification.repo.js                           # Database operations
├── services/
│   └── notification.service.js                        # Frontend API service
└── utils/
    └── notification.js                                # Helper functions

scripts/
└── createDemoNotifications.js                         # Testing script
```
