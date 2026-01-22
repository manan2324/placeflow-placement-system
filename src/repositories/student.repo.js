import StudentProfile from "@/models/StudentProfile";

export async function findStudentProfileByUserId(userId, { session, populateUser = false } = {}) {
  let q = StudentProfile.findOne({ userId });
  if (populateUser) q = q.populate("userId", "name email");
  if (session) q.session(session);
  return q;
}

export async function findStudentProfileById(profileId, { session } = {}) {
  const q = StudentProfile.findById(profileId);
  if (session) q.session(session);
  return q;
}

export async function findStudentByEnrollmentNumber(enrollmentNumber, { session } = {}) {
  const q = StudentProfile.findOne({ enrollmentNumber });
  if (session) q.session(session);
  return q;
}

export async function createStudentProfile(profileData, { session } = {}) {
  if (session) {
    const [created] = await StudentProfile.create([profileData], { session });
    return created;
  }
  return StudentProfile.create(profileData);
}

export async function updateStudentResumeByUserId(userId, { resumeUrl, resumeUpdatedAt }, { session } = {}) {
  const q = StudentProfile.findOneAndUpdate(
    { userId },
    { resumeUrl, resumeUpdatedAt },
    { new: true }
  );
  if (session) q.session(session);
  return q;
}
