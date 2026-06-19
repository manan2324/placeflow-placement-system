import { json, withErrorHandling } from "@/utils/apiResponse";
import { parseJson } from "@/utils/parse";
import { validate } from "@/utils/validate";
import { verifyOtpSchema } from "@/validators/auth.schema";
import { verifyRegistrationOtp } from "@/services/otp.service";

export const POST = withErrorHandling(async (req) => {
  const body = await parseJson(req);
  const { email, otp } = validate(verifyOtpSchema, body);

  const result = await verifyRegistrationOtp({ email, otp });

  if (result.pendingApproval) {
    return json(
      {
        message: "Email verified successfully. Your account is pending admin approval. We will notify you via email once approved.",
        pendingApproval: true,
        name: result.name,
      },
      { status: 200 }
    );
  }

  return json(
    {
      message: "Email verified successfully. Registration complete!",
      token: result.token,
      role: result.role,
      name: result.name,
    },
    { status: 201 }
  );
});
