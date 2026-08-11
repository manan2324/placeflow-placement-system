import connectDB from "@/lib/mongodb";
import { withCache, CACHE_KEYS } from "@/lib/cache";

import {
    aggregateApplicationStatusCounts,
    aggregateCompanyApplicationStats,
    aggregateBranchWiseStats,
    countApplications,
    countCompanies,
    countStudents,
    countPlacedStudents,
} from "@/repositories/adminDashboard.repo";

export const getAdminDashboard = async () => {
    return withCache(CACHE_KEYS.ADMIN_DASHBOARD, 300, async () => {
        await connectDB();

        const totalStudents = await countStudents();
        const openCompanies = await countCompanies();
        const totalApplications = await countApplications();
        const placedStudents = await countPlacedStudents();

        // status distribution
        const statusAgg = await aggregateApplicationStatusCounts();

        const statusCounts = {
            APPLIED: 0,
            SHORTLISTED: 0,
            REJECTED: 0,
            SELECTED: 0
        };

        statusAgg.forEach((s) => {
            if (Object.prototype.hasOwnProperty.call(statusCounts, s._id)) {
                statusCounts[s._id] = s.count;
            }
        });

        // company-wise stats
        const companyStats = await aggregateCompanyApplicationStats();

        // branch-wise stats
        const branchWiseStats = await aggregateBranchWiseStats();

        // selection rate
        const selectionRate = totalApplications === 0
            ? 0
            : ((statusCounts.SELECTED / totalApplications) * 100).toFixed(2);

        return {
            totalStudents,
            openCompanies,
            totalApplications,
            placedStudents,
            statusCounts,
            companyStats,
            branchWiseStats,
            selectionRate: Number(selectionRate)
        };
    });
};
