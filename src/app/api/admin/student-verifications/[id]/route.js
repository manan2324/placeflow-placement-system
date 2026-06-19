import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/lib/auth";
import { parseJson } from "@/utils/parse";
import { sendApprovalEmail, sendRejectionEmail } from "@/services/email.service";

export const PATCH = withErrorHandling(async (req, { params }) => {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const forbidden = requireRole("ADMIN")(user);
  if (forbidden) return forbidden;

  await connectDB();

  const { id } = await params;
  const body = await parseJson(req);
  const { action } = body;

  if (!["approve", "reject"].includes(action)) {
    return json(
      { message: "Invalid action. Use 'approve' or 'reject'." },
      { status: 400 }
    );
  }

  const student = await User.findById(id);
  if (!student || student.role !== "STUDENT") {
    return json({ message: "Student not found." }, { status: 404 });
  }

  if (action === "approve") {
    if (student.isApproved === true) {
      return json({ message: "Student is already approved." }, { status: 400 });
    }

    student.isApproved = true;
    student.approvedAt = new Date();
    await student.save();

    sendApprovalEmail(student.email, student.name).catch((err) => {
      console.error("[Email] Failed to send approval email:", err);
    });

    return json({
      message: "Student approved successfully.",
      data: {
        _id: student._id,
        name: student.name,
        email: student.email,
        isApproved: true,
        approvedAt: student.approvedAt,
      },
    });
  }

  if (action === "reject") {
    const studentName = student.name;
    const studentEmail = student.email;

    await StudentProfile.deleteOne({ userId: student._id });
    await User.findByIdAndDelete(student._id);

    sendRejectionEmail(studentEmail, studentName).catch((err) => {
      console.error("[Email] Failed to send rejection email:", err);
    });

    return json({
      message: "Student rejected and account removed. They can re-register.",
    });
  }
});
