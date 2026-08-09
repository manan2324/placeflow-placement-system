import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { registerStudentSchema } from "@/validators/auth.schema";
import { registerStudent } from "@/services/auth.service";
import { rateLimit } from "@/utils/rateLimit";

export const POST = withErrorHandling(async (req) => {
    const rl = await rateLimit(req, { keyPrefix: "auth:register", limit: 5, windowMs: 10 * 60 * 1000 });
    if (rl) return rl;

    const body = await parseJson(req);
    const payload = validate(registerStudentSchema, body);

    const { userId } = await registerStudent(payload);

    return json(
        { message: "Student registered successfully.", userId },
        { status: 201 }
    );
});