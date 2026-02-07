/**
 * Script to create demo notifications for testing the notification feature
 * 
 * Usage: node scripts/createDemoNotifications.js <userId>
 * 
 * This script will create sample notifications for a user to test the notification dropdown functionality
 */

import { connectDB } from "../src/lib/mongodb.js";
import {
  notifyApplicationStatus,
  notifyProfileUpdate,
  notifyNewCompany,
  notifyDeadlineReminder,
  notifyAnnouncement,
  createUserNotification,
} from "../src/utils/notification.js";

async function createDemoNotifications(userId) {
  try {
    await connectDB();
    console.log("Connected to database...");

    // Create various demo notifications
    console.log("\nCreating demo notifications for user:", userId);

    // Application submitted notification
    await notifyApplicationStatus(userId, "Tech Corp", "submitted");
    console.log("✓ Created application submitted notification");

    // Application approved notification
    await notifyApplicationStatus(userId, "Microsoft", "approved");
    console.log("✓ Created application approved notification");

    // Shortlisted notification
    await notifyApplicationStatus(userId, "Google", "shortlisted");
    console.log("✓ Created shortlisted notification");

    // Profile update request submitted
    await createUserNotification(
      userId,
      "Profile Update Request Submitted",
      "Your profile update request has been submitted successfully. You will be notified once it is reviewed by the admin."
    );
    console.log("✓ Created profile update request submitted notification");

    // Profile update approved
    await notifyProfileUpdate(userId, "approved");
    console.log("✓ Created profile update approved notification");

    // Profile update rejected with reason
    await notifyProfileUpdate(
      userId,
      "rejected",
      "The CGPA value you provided seems incorrect. Please verify and resubmit."
    );
    console.log("✓ Created profile update rejected notification");

    // New company posted
    await notifyNewCompany(userId, "Amazon", "March 15, 2026");
    console.log("✓ Created new company notification");

    // Deadline reminder
    await notifyDeadlineReminder(userId, "Apple", "February 20, 2026");
    console.log("✓ Created deadline reminder notification");

    // General announcement
    await notifyAnnouncement(
      userId,
      "Placement drive for 2026 batch will start from March 1st. Make sure your profile is updated!"
    );
    console.log("✓ Created general announcement notification");

    // Rejected application (older notification)
    await notifyApplicationStatus(userId, "Facebook", "rejected");
    console.log("✓ Created application rejected notification");
10
    console.log("\n✅ Successfully created 8 demo notifications!");
    console.log(
      "\nYou can now login as this user and check the notification dropdown in the student dashboard."
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating demo notifications:", error);
    process.exit(1);
  }
}

// Get userId from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error("Error: Please provide a userId as argument");
  console.log("Usage: node scripts/createDemoNotifications.js <userId>");
  process.exit(1);
}

createDemoNotifications(userId);
