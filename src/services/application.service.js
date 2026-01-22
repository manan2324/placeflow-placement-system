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
  if (studentProfile.hasBacklog === null || studentProfile.hasBacklog === undefined) {
    throw badRequest("Please complete your profile: Backlog status is required", "PROFILE_INCOMPLETE");
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

  if (!company.backlogAllowed && studentProfile.hasBacklog) {
    throw forbidden(
      "Backlog not allowed for this company",
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
        hasBacklog: studentProfile.hasBacklog,
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
    "Has Backlog",
    "Application Status",
    "Applied At",
  ];

  const rows = applications.map((app) => [
    csvEscape(app.studentId?.enrollmentNumber, true),
    csvEscape(app.snapshot.branch),
    csvEscape(app.snapshot.cgpa),
    csvEscape(app.snapshot.hasBacklog ? "YES" : "NO"),
    csvEscape(app.status),
    csvEscape(app.appliedAt.toISOString()),
  ]);

  const csvContent = buildCsv(headers, rows);
  const fileName = `${company.name}_applications.csv`;

  return { csvContent, fileName };
}
