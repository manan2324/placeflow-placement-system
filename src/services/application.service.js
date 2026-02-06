import connectDB from "@/lib/mongodb";

import { buildCsv, csvEscape } from "@/utils/csv";
import { badRequest, conflict, forbidden, notFound } from "@/utils/errors";
import { assertObjectId } from "@/utils/objectId";

import { findCompanyById } from "@/repositories/company.repo";
import { findStudentProfileByUserId } from "@/repositories/student.repo";
import {
  createApplication,
  findApplicationById,
  findExistingApplication,
  listApplicationsByCompany,
  listApplicationsByCompanyForExport,
  listApplicationsByStudent,
  listFilteredApplicationsForExport,
  saveApplication,
} from "@/repositories/application.repo";
import { createApplicationLog } from "@/repositories/applicationLog.repo";
import { createNotification } from "@/repositories/notification.repo";

const ALLOWED_TRANSITIONS = {
  APPLIED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["SELECTED", "REJECTED"],
};

export async function applyToCompany({ userId, companyId }) {
  await connectDB();

  assertObjectId(companyId, { name: "companyId", code: "BAD_ID" });

  const company = await findCompanyById(companyId);
  if (!company) throw notFound("Company not found", "COMPANY_NOT_FOUND");

  if (company.status !== "OPEN") {
    throw badRequest(
      "Company is not open for applications",
      "COMPANY_NOT_OPEN"
    );
  }

  if (company.applicationDeadline <= new Date()) {
    throw badRequest("Application deadline has passed", "DEADLINE_PASSED");
  }

  const studentProfile = await findStudentProfileByUserId(userId);
  if (!studentProfile)
    throw notFound("Student profile not found", "PROFILE_NOT_FOUND");

  // Validate required profile fields
  if (!studentProfile.branch) {
    throw badRequest("Please complete your profile: Branch is required", "PROFILE_INCOMPLETE");
  }
  if (studentProfile.cgpa === null || studentProfile.cgpa === undefined) {
    throw badRequest("Please complete your profile: CGPA is required", "PROFILE_INCOMPLETE");
  }
  if (studentProfile.backlogCount === null || studentProfile.backlogCount === undefined) {
    throw badRequest("Please complete your profile: Backlog count is required", "PROFILE_INCOMPLETE");
  }

  const existing = await findExistingApplication(
    studentProfile._id,
    company._id
  );
  if (existing)
    throw conflict("Duplicate application detected", "DUPLICATE_APPLICATION");

  if (!company.eligibleBranches.includes(studentProfile.branch)) {
    throw forbidden("Branch not eligible", "BRANCH_NOT_ELIGIBLE");
  }

  if (studentProfile.cgpa < company.minCgpa) {
    throw forbidden(
      "CGPA does not meet eligibility criteria",
      "NOT_ELIGIBLE_CGPA"
    );
  }

  if (studentProfile.backlogCount > company.backlogCount) {
    throw forbidden(
      `Student has ${studentProfile.backlogCount} backlog(s) but company allows only ${company.backlogCount}`,
      "NOT_ELIGIBLE_BACKLOG"
    );
  }

  try {
    const application = await createApplication({
      studentId: studentProfile._id,
      companyId: company._id,
      status: "APPLIED",
      snapshot: {
        branch: studentProfile.branch,
        cgpa: studentProfile.cgpa,
        backlogCount: studentProfile.backlogCount,
      },
      appliedAt: new Date(),
    });

    await createNotification({
      userId,
      title: "Application Submitted",
      message: `You have successfully applied to ${company.name}.`,
    });

    return { applicationId: application._id };
  } catch (err) {
    if (err?.code === 11000) {
      throw conflict("Duplicate application detected", "DUPLICATE_APPLICATION");
    }
    throw err;
  }
}

export async function listStudentApplications({ userId }) {
  await connectDB();

  const studentProfile = await findStudentProfileByUserId(userId);
  if (!studentProfile)
    throw notFound("Student profile not found", "PROFILE_NOT_FOUND");

  const applications = await listApplicationsByStudent(studentProfile._id);

  return applications.map((app) => ({
    _id: app._id,
    applicationId: app._id,
    status: app.status,
    appliedAt: app.appliedAt,
    createdAt: app.appliedAt,
    companyName: app.companyId.name,
    company: {
      id: app.companyId._id,
      name: app.companyId.name,
      role: app.companyId.role,
      ctc: app.companyId.ctc,
      status: app.companyId.status,
      applicationDeadline: app.companyId.applicationDeadline,
    },
  }));
}

export async function getStudentApplicationDetails({ userId, applicationId }) {
  await connectDB();

  assertObjectId(applicationId, { name: "applicationId", code: "BAD_ID" });

  const studentProfile = await findStudentProfileByUserId(userId);
  if (!studentProfile)
    throw notFound("Student profile not found", "PROFILE_NOT_FOUND");

  const application = await findApplicationById(applicationId, { 
    populateCompany: true 
  });
  
  if (!application)
    throw notFound("Application not found", "APPLICATION_NOT_FOUND");

  // Verify ownership
  if (application.studentId.toString() !== studentProfile._id.toString()) {
    throw forbidden("Access denied", "ACCESS_DENIED");
  }

  return {
    _id: application._id,
    applicationId: application._id,
    status: application.status,
    appliedAt: application.appliedAt,
    lastUpdatedAt: application.lastUpdatedAt,
    snapshot: application.snapshot,
    company: {
      _id: application.companyId._id,
      name: application.companyId.name,
      role: application.companyId.role,
      ctc: application.companyId.ctc,
      minCgpa: application.companyId.minCgpa,
      backlogCount: application.companyId.backlogCount,
      eligibleBranches: application.companyId.eligibleBranches,
      applicationDeadline: application.companyId.applicationDeadline,
      status: application.companyId.status,
    },
  };
}

export async function listCompanyApplications({ companyId, status }) {
  await connectDB();

  const filter = {};

  if (companyId) {
    assertObjectId(companyId, { name: "companyId", code: "BAD_ID" });
    filter.companyId = companyId;
  }

  if (status) filter.status = status;

  return listApplicationsByCompany(filter);
}

export async function updateApplicationStatus({
  adminUserId,
  applicationId,
  newStatus,
  remark,
}) {
  await connectDB();

  assertObjectId(applicationId, { name: "applicationId", code: "BAD_ID" });

  const application = await findApplicationById(applicationId, {
    populateCompany: true,
    populateStudent: true,
  });

  if (!application)
    throw notFound("Application not found", "APPLICATION_NOT_FOUND");

  const currentStatus = application.status;

  if (currentStatus === newStatus) {
    throw badRequest(
      `Application is already ${currentStatus}`,
      "STATUS_UNCHANGED"
    );
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    throw badRequest(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  application.status = newStatus;
  await saveApplication(application);

  await createApplicationLog({
    applicationId: application._id,
    oldStatus: currentStatus,
    newStatus,
    changedBy: adminUserId,
    remark,
  });

  // NOTE: `application.studentId` is StudentProfile; notifications should target the User.
  const targetUserId = application.studentId?.userId;
  if (targetUserId) {
    await createNotification({
      userId: targetUserId,
      title: "Application Status Updated",
      message: `Your application for ${application.companyId.name} is now ${newStatus}.`,
    });
  }

  return { message: "Application status updated successfully" };
}

export async function exportCompanyApplicationsCsv({ companyId }) {
  await connectDB();

  assertObjectId(companyId, { name: "companyId", code: "BAD_ID" });

  const company = await findCompanyById(companyId);
  if (!company) throw notFound("Company not found", "COMPANY_NOT_FOUND");

  const applications = await listApplicationsByCompanyForExport(companyId);

  const headers = [
    "Enrollment Number",
    "Branch",
    "CGPA",
    "Backlog Count",
    "Application Status",
    "Applied At",
  ];

  const rows = applications.map((app) => [
    csvEscape(app.studentId?.enrollmentNumber, true),
    csvEscape(app.snapshot?.branch || app.studentId?.branch || "N/A"),
    csvEscape(app.snapshot?.cgpa || app.studentId?.cgpa || "N/A"),
    csvEscape(app.snapshot?.backlogCount ?? app.studentId?.backlogCount ?? "N/A"),
    csvEscape(app.status),
    csvEscape(app.appliedAt?.toISOString() || "N/A"),
  ]);

  const csvContent = buildCsv(headers, rows);
  const fileName = `${company.name}_applications.csv`;

  return { csvContent, fileName };
}

export async function exportFilteredApplicationsCsv(filters) {
  await connectDB();

  // Validate companyIds if provided
  if (filters.companyId && filters.companyId.length > 0) {
    filters.companyId.forEach((id) => 
      assertObjectId(id, { name: "companyId", code: "BAD_ID" })
    );
  }

  const applications = await listFilteredApplicationsForExport(filters);

  // Apply client-side filters for fields not supported at DB level
  let filteredApplications = applications;

  if (filters.branch && filters.branch.length > 0) {
    filteredApplications = filteredApplications.filter((app) =>
      filters.branch.includes(app.studentId?.branch || app.snapshot?.branch)
    );
  }

  if (filters.minCgpa) {
    const minCgpa = Number(filters.minCgpa);
    if (!Number.isNaN(minCgpa)) {
      filteredApplications = filteredApplications.filter((app) => {
        const cgpa = app.studentId?.cgpa ?? app.snapshot?.cgpa;
        return typeof cgpa === "number" && cgpa >= minCgpa;
      });
    }
  }

  if (filters.maxBacklogCount !== undefined && filters.maxBacklogCount !== "") {
    const maxBacklogs = Number(filters.maxBacklogCount);
    if (!Number.isNaN(maxBacklogs)) {
      filteredApplications = filteredApplications.filter((app) => {
        const count = app.studentId?.backlogCount ?? app.snapshot?.backlogCount ?? 0;
        return count <= maxBacklogs;
      });
    }
  }

  if (filters.enrollmentSearch) {
    const searchTerm = filters.enrollmentSearch.toLowerCase();
    filteredApplications = filteredApplications.filter((app) =>
      (app.studentId?.enrollmentNumber || "").toLowerCase().includes(searchTerm)
    );
  }

  const headers = [
    "Enrollment Number",
    "Company",
    "Branch",
    "CGPA",
    "Backlog Count",
    "Application Status",
    "Applied At",
  ];

  const rows = filteredApplications.map((app) => [
    csvEscape(app.studentId?.enrollmentNumber, true),
    csvEscape(app.companyId?.name || "N/A"),
    csvEscape(app.snapshot?.branch || app.studentId?.branch || "N/A"),
    csvEscape(app.snapshot?.cgpa || app.studentId?.cgpa || "N/A"),
    csvEscape(app.snapshot?.backlogCount ?? app.studentId?.backlogCount ?? "N/A"),
    csvEscape(app.status),
    csvEscape(app.appliedAt?.toISOString() || "N/A"),
  ]);

  const csvContent = buildCsv(headers, rows);
  
  // Generate dynamic filename based on filters
  let filenameParts = [];
  if (filters.branch && filters.branch.length > 0) {
    filenameParts.push(filters.branch.join("-"));
  }
  if (filters.status) {
    filenameParts.push(filters.status);
  }
  if (filters.companyId && filters.companyId.length === 1 && filteredApplications.length > 0) {
    filenameParts.push(filteredApplications[0]?.companyId?.name);
  } else if (filters.companyId && filters.companyId.length > 1) {
    filenameParts.push(`${filters.companyId.length}companies`);
  }
  
  const fileName = filenameParts.length > 0 
    ? `${filenameParts.join("_")}_applications.csv`
    : "filtered_applications.csv";

  return { csvContent, fileName };
}
