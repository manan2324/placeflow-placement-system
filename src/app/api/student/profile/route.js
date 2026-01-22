import { requireAuth, requireRole } from "@/lib/auth";
import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { updateResumeSchema } from "@/validators/student.schema";
import { getStudentProfile, updateStudentResume } from "@/services/student.service";

export const GET = withErrorHandling(async (req) => {
    // auth
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // role check
    const roleError = requireRole("STUDENT")(user);
    if (roleError) return roleError;

    const profile = await getStudentProfile(user._id);
    return json(profile, { status: 200 });
});

export const PUT = withErrorHandling(async (req) => {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    const roleError = requireRole("STUDENT")(user);
    if (roleError) return roleError;

    const body = await parseJson(req);
    validate(updateResumeSchema, body);

    const updatedProfile = await updateStudentResume(user._id, body);

    return json(
        { message: "Resume updated successfully", profile: updatedProfile },
        { status: 200 }
    );
});