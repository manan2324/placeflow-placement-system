import connectDB from "@/lib/mongodb";

import { notFound } from "@/utils/errors";

import { countCompanies } from "@/repositories/company.repo";
import { findStudentProfileByUserId } from "@/repositories/student.repo";
import { listApplicationsByStudent } from "@/repositories/application.repo";
import { listRecentNotificationsByUser } from "@/repositories/notification.repo";

export const getStudentDashboard = async (userId) => {
    await connectDB();

    const student = await findStudentProfileByUserId(userId);
    if (!student) {
        throw notFound("Student profile not found", "PROFILE_NOT_FOUND");
    }

    const now = new Date();

    // open companies
    const openCompanies = await countCompanies({
        status: "OPEN",
        applicationDeadline: { $gt: now },
    });

    // eligible companies 
    const eligibleFilter = {
        status: "OPEN",
        applicationDeadline: { $gt: now },
        eligibleBranches: student.branch,
        minCgpa: { $lte: student.cgpa },
    };

    // if student has backlog, only companies allowing backlog are eligible. Otherwise, backlogAllowed can be either true/false.
    if (student.hasBacklog) {
        eligibleFilter.backlogAllowed = true;
    }
    const eligibleCompanies = await countCompanies(eligibleFilter);

    // applications
    const applications = await listApplicationsByStudent(student._id);

    // status counts
    const statusCounts = {
        APPLIED: 0,
        SHORTLISTED: 0,
        REJECTED: 0,
        SELECTED: 0,
    };

    applications.forEach((a) => {
        statusCounts[a.status]++;
    });

    // recent applications
    const recentApplications = applications.slice(0, 5);

    // notifications
    const recentNotifications = await listRecentNotificationsByUser(userId, { limit: 5 });

    return {
        openCompanies,
        eligibleCompanies,
        appliedCompanies: applications.length,
        totalApplications: applications.length,
        pendingCount: statusCounts.APPLIED,
        shortlistedCount: statusCounts.SHORTLISTED,
        rejectedCount: statusCounts.REJECTED,
        selectedCount: statusCounts.SELECTED,
        statusCounts,
        recentApplications,
        recentNotifications,
    };
};