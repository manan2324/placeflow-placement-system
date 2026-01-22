import connectDB from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { createCompanySchema } from "@/validators/company.schema";
import { validate } from "@/utils/validate";
import { badRequest, conflict, notFound } from "@/utils/errors";
import { assertObjectId } from "@/utils/objectId";
import { createCompany, findCompanyById, findCompanyByName, listCompanies, updateCompanyStatus } from "@/repositories/company.repo";
import { findStudentProfileByUserId } from "@/repositories/student.repo";
import { findExistingApplication } from "@/repositories/application.repo";

export async function listCompaniesForRequest(req) {
  await connectDB();

  // Do not trust role from token alone. If authenticated, use DB user role.
  // If unauthenticated, treat as STUDENT visibility.
  const authResult = await requireAuth(req);
  const role = authResult?.user?.role ?? "STUDENT";

  const filter =
    role === "ADMIN"
      ? {}
      : {
          status: "OPEN",
          applicationDeadline: { $gt: new Date() },
        };

  const companies = await listCompanies(filter);

  // If student, check which companies they've already applied to
  if (role === "STUDENT" && authResult?.user?._id) {
    const studentProfile = await findStudentProfileByUserId(authResult.user._id);
    
    if (studentProfile) {
      // Check applications for each company
      const companiesWithStatus = await Promise.all(
        companies.map(async (company) => {
          const existingApp = await findExistingApplication(studentProfile._id, company._id);
          return {
            ...company.toObject(),
            hasApplied: !!existingApp
          };
        })
      );
      return companiesWithStatus;
    }
  }

  return companies;
}

export async function createCompanyAsAdmin(adminUserId, body) {
  await connectDB();

  const payload = validate(createCompanySchema, body);

  const deadline = payload.applicationDeadline instanceof Date
    ? payload.applicationDeadline
    : new Date(payload.applicationDeadline);

  if (Number.isNaN(deadline.getTime())) {
    throw badRequest("applicationDeadline is invalid", "INVALID_DEADLINE");
  }

  if (deadline <= new Date()) {
    throw badRequest("Application deadline must be in the future", "DEADLINE_IN_PAST");
  }

  const existing = await findCompanyByName(payload.name);
  if (existing) throw conflict("Company already exists", "COMPANY_EXISTS");

  return createCompany({
    name: payload.name,
    role: payload.role,
    ctc: payload.ctc,
    eligibleBranches: payload.eligibleBranches,
    minCgpa: payload.minCgpa,
    backlogAllowed: payload.backlogAllowed ?? false,
    applicationDeadline: deadline,
    createdBy: adminUserId,
  });
}

export async function closeCompanyAsAdmin(companyId) {
  await connectDB();

  assertObjectId(companyId, { name: "companyId", code: "BAD_ID" });

  const company = await findCompanyById(companyId);
  if (!company) throw notFound("Company not found", "COMPANY_NOT_FOUND");

  if (company.status === "CLOSED") {
    throw badRequest("Company is permanently closed", "COMPANY_ALREADY_CLOSED");
  }

  if (company.applicationDeadline <= new Date()) {
    throw badRequest("Cannot change status after deadline", "DEADLINE_PASSED");
  }

  await updateCompanyStatus(company._id, "CLOSED");
  return { message: "Company closed successfully" };
}
