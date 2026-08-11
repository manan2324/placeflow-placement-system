import connectDB from "@/lib/mongodb";
import { withCache, CACHE_KEYS } from "@/lib/cache";

import { notFound } from "@/utils/errors";

import { countCompanies } from "@/repositories/company.repo";
import { findStudentProfileByUserId } from "@/repositories/student.repo";
import { listApplicationsByStudent } from "@/repositories/application.repo";
import { listRecentNotificationsByUser } from "@/repositories/notification.repo";

export const getStudentDashboard = async (userId) => {
    return withCache(CACHE_KEYS.STUDENT_DASHBOARD(userId), 180, async () => {
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
            eligibleBranches: { $in: [student.branch] },
            minCgpa: { $lte: student.cgpa },
        };

        // filter companies that allow at least the number of backlogs the student has
        if (student.backlogCount > 0) {
            eligibleFilter.backlogCount = { $gte: student.backlogCount };
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
    });
};