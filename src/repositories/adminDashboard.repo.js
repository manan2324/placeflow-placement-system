import Application from "@/models/Application";
import Company from "@/models/Company";
import StudentProfile from "@/models/StudentProfile";

export async function countStudents({ session } = {}) {
    const q = StudentProfile.countDocuments();
    if (session) q.session(session);
    return q;
}

export async function countCompanies({ session } = {}) {
    const q = Company.countDocuments({ status: "OPEN" });
    if (session) q.session(session);
    return q;
}

export async function countApplications({ session } = {}) {
    const q = Application.countDocuments();
    if (session) q.session(session);
    return q;
}

export async function aggregateApplicationStatusCounts({ session } = {}) {
    const pipeline = [
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ];

    const agg = Application.aggregate(pipeline);
    if (session) agg.session(session);
    return agg;
}

export async function aggregateCompanyApplicationStats({ session } = {}) {
    const pipeline = [
        {
            $group: {
                _id: "$companyId",
                applicants: { $sum: 1 },
                selected: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "SELECTED"] }, 1, 0],
                    },
                },
            },
        },
        {
            $lookup: {
                from: "companies",
                localField: "_id",
                foreignField: "_id",
                as: "company",
            },
        },
        { $unwind: "$company" },
        {
            $project: {
                companyId: "$_id",
                companyName: "$company.name",
                applicants: 1,
                selected: 1,
            },
        },
    ];

    const agg = Application.aggregate(pipeline);
    if (session) agg.session(session);
    return agg;
}

export async function aggregateBranchWiseStats({ session } = {}) {
    const pipeline = [
        {
            $group: {
                _id: "$snapshot.branch",
                totalApplications: { $sum: 1 },
                placed: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "SELECTED"] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                branch: "$_id",
                totalApplications: 1,
                placed: 1,
                _id: 0,
            },
        },
        { $sort: { branch: 1 } },
    ];

    const agg = Application.aggregate(pipeline);
    if (session) agg.session(session);
    return agg;
}

export async function countPlacedStudents({ session } = {}) {
    const pipeline = [
        {
            $match: {
                status: "SELECTED",
            },
        },
        {
            $group: {
                _id: "$studentId",
            },
        },
        {
            $count: "total",
        },
    ];

    const agg = Application.aggregate(pipeline);
    if (session) agg.session(session);
    const result = await agg;
    return result[0]?.total || 0;
}
