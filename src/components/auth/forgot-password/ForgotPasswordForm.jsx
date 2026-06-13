"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, Mail, ShieldCheck, ArrowLeft, RefreshCw, Eye, EyeOff, KeyRound, CheckCircle } from "lucide-react";

const OTP_LENGTH = 4;
const OTP_EXPIRY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordForm() {
  const router = useRouter();

  // Step: "email" | "otp" | "reset" | "success"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP state
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [expirySeconds, setExpirySeconds] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Reset state
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Expiry countdown
  useEffect(() => {
    if (step !== "otp" || expirySeconds <= 0) return;
    const timer = setInterval(() => setExpirySeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  // Resend cooldown
  useEffect(() => {
    if (step !== "otp" || resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      toast.success("Verification code sent to your email!");
      setStep("otp");
      setExpirySeconds(OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError("");

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = useCallback(async () => {
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    if (expirySeconds <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      setResetToken(data.resetToken);
      setStep("reset");
      toast.success("OTP verified! Set your new password.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [digits, email, expirySeconds]);

  // Auto-submit when all digits filled
  useEffect(() => {
    if (step === "otp" && digits.every((d) => d !== "") && !loading) {
      handleVerifyOtp();
    }
  }, [digits, step, loading, handleVerifyOtp]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }

      setDigits(Array(OTP_LENGTH).fill(""));
      setExpirySeconds(OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      inputRefs.current[0]?.focus();
      toast.success("New OTP sent to your email!");
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const expired = expirySeconds <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 animate-scale-in">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 text-center animate-shake">
          {error}
        </div>
      )}

      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Enter the email address associated with your account.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Sending Code...
              </span>
            ) : (
              "Send Verification Code"
            )}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === "otp" && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
            </div>
            <p className="text-sm text-gray-500">
              We&apos;ve sent a 4-digit code to
            </p>
            <p className="text-sm font-semibold text-indigo-600 flex items-center justify-center gap-1 mt-1">
              <Mail className="w-4 h-4" />
              {email}
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`forgot-otp-digit-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading || expired}
                className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all duration-200 ${
                  digit
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 bg-white text-gray-900"
                } ${loading || expired ? "opacity-50 cursor-not-allowed" : "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"}`}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            {expired ? (
              <p className="text-sm text-red-600 font-medium">
                Code expired. Please request a new one.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Code expires in{" "}
                <span className={`font-semibold ${expirySeconds <= 60 ? "text-red-600" : "text-indigo-600"}`}>
                  {formatTime(expirySeconds)}
                </span>
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={loading || digits.some((d) => !d) || expired}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>

          {/* Resend & Back */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep("email"); setError(""); }}
              disabled={loading}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending || loading}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resending
                ? "Sending..."
                : "Resend Code"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="text-center mb-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <KeyRound className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">
              Set a new password for <span className="font-semibold text-indigo-600">{email}</span>
            </p>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-2">
              Retype New Password
            </label>
            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Resetting Password...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Password Reset Successful!</h3>
            <p className="text-sm text-gray-500 mt-2">
              Your password has been changed. You can now sign in with your new password.
            </p>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
