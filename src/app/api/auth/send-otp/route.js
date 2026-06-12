import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { registerStudentSchema } from "@/validators/auth.schema";
import { requestRegistrationOtp } from "@/services/otp.service";

export const POST = withErrorHandling(async (req) => {
  const body = await parseJson(req);
  const payload = validate(registerStudentSchema, body);

  const result = await requestRegistrationOtp(payload);

  return json(result, { status: 200 });
});
