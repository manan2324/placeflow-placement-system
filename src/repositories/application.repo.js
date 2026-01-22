import Application from "@/models/Application";
import Company from "@/models/Company";
import StudentProfile from "@/models/StudentProfile";

export async function findApplicationById(applicationId, { session, populateCompany = false, populateStudent = false } = {}) {
  let q = Application.findById(applicationId);
  if (populateCompany) q = q.populate("companyId", "name role");
  if (populateStudent) q = q.populate({ path: "studentId", model: StudentProfile, select: "enrollmentNumber branch cgpa hasBacklog userId" });
  if (session) q.session(session);
  return q;
}

export async function findExistingApplication(studentId, companyId, { session } = {}) {
  const q = Application.findOne({ studentId, companyId });
  if (session) q.session(session);
  return q;
}

export async function createApplication(applicationData, { session } = {}) {
  if (session) {
    const [created] = await Application.create([applicationData], { session });
    return created;
  }
  return Application.create(applicationData);
}

export async function listApplicationsByStudent(studentId, { session } = {}) {
  const q = Application.find({ studentId })
    .populate({
      path: "companyId",
      model: Company,
      select: "name role ctc status applicationDeadline",
    })
    .sort({ appliedAt: -1 });
  if (session) q.session(session);
  return q;
}

export async function listApplicationsByCompany(filter, { session } = {}) {
  const q = Application.find(filter)
    .populate({
      path: "studentId",
      model: StudentProfile,
      select: "enrollmentNumber branch cgpa hasBacklog userId",
      populate: {
        path: "userId",
        select: "name email",
      },
    })
    .populate({
      path: "companyId",
      model: Company,
      select: "name role",
    })
    .sort({ appliedAt: 1 });
  if (session) q.session(session);
  return q;
}

export async function listApplicationsByCompanyForExport(companyId, { session } = {}) {
  const q = Application.find({ companyId })
    .populate({
      path: "studentId",
      model: StudentProfile,
      select: "enrollmentNumber branch cgpa hasBacklog userId",
    })
    .sort({ appliedAt: 1 });
  if (session) q.session(session);
  return q;
}

export async function saveApplication(applicationDoc, { session } = {}) {
  return applicationDoc.save({ session });
}
