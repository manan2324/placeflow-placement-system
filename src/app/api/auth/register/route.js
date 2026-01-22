import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { registerStudentSchema } from "@/validators/auth.schema";
import { registerStudent } from "@/services/auth.service";

export const POST = withErrorHandling(async (req) => {
    const body = await parseJson(req);
    const payload = validate(registerStudentSchema, body);

    const { userId } = await registerStudent(payload);

    return json(
        { message: "Student registered successfully.", userId },
        { status: 201 }
    );
});