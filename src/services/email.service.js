import nodemailer from "nodemailer";

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback: Ethereal fake SMTP for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("[Email] Using Ethereal test account:", testAccount.user);
  }

  return transporter;
}

/**
 * Send an OTP verification email.
 * @param {string} to - recipient email
 * @param {string} otp - 4-digit plain-text OTP
 */
export async function sendOtpEmail(to, otp) {
  const transport = await getTransporter();

  const from = process.env.EMAIL_FROM || '"PlaceFlow" <noreply@placeflow.com>';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">PlaceFlow</h1>
        <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Placement Monitoring System</p>
      </div>

      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 12px 0;">Your verification code is</p>
        <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #ffffff; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
      </div>

      <p style="color: #374151; font-size: 14px; line-height: 1.6; text-align: center;">
        Enter this code on the registration page to verify your email address.
        This code will expire in <strong>5 minutes</strong>.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;

  const info = await transport.sendMail({
    from,
    to,
    subject: "Your PlaceFlow Verification Code",
    html,
  });

  // In dev with Ethereal, log the preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("[Email] Preview URL:", previewUrl);
  }

  return info;
}
