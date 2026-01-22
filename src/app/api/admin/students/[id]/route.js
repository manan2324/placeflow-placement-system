import connectDB from "@/lib/mongodb";
import StudentProfile from "@/models/StudentProfile";
import User from "@/models/User";
import Application from "@/models/Application";
import bcrypt from "bcryptjs";
import { json, errorResponse, withErrorHandling } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/lib/auth";
import { assertObjectId } from "@/utils/objectId";

export const DELETE = withErrorHandling(async (req, { params }) => {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const forbidden = requireRole("ADMIN")(user);
  if (forbidden) return forbidden;

  await connectDB();

  // Await params in Next.js 14+
  const { id } = await params;
  
  // Validate ObjectId format
  assertObjectId(id, { name: "student ID" });
  
  // Parse request body for password verification
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body", { status: 400, errorCode: "INVALID_BODY" });
  }

  const { password } = body;
  if (!password) {
    return errorResponse("Password is required to delete student", { 
      status: 400, 
      errorCode: "PASSWORD_REQUIRED" 
    });
  }

  // Verify admin's password
  const adminUser = await User.findById(user._id);
  if (!adminUser) {
    return errorResponse("Admin user not found", { status: 404, errorCode: "USER_NOT_FOUND" });
  }

  const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
  if (!isPasswordValid) {
    return errorResponse("Invalid password", { status: 401, errorCode: "INVALID_PASSWORD" });
  }

  // Find student profile
  const studentProfile = await StudentProfile.findById(id);
  if (!studentProfile) {
    return errorResponse("Student not found", { status: 404, errorCode: "STUDENT_NOT_FOUND" });
  }

  // Delete all applications for this student
  await Application.deleteMany({ studentId: id });

  // Delete student profile
  await StudentProfile.findByIdAndDelete(id);

  // Delete associated user account
  await User.findByIdAndDelete(studentProfile.userId);

  return json({ 
    success: true, 
    message: "Student deleted successfully" 
  });
});
