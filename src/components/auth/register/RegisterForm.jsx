"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";

export default function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    enrollmentNumber: "",
    branch: "",
    cgpa: "",
    backlogCount: 0,
    mobileNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "CHE"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.enrollmentNumber) {
      newErrors.enrollmentNumber = "Enrollment number is required";
    }

    if (!formData.branch) {
      newErrors.branch = "Branch is required";
    }

    if (formData.cgpa && (parseFloat(formData.cgpa) < 0 || parseFloat(formData.cgpa) > 10)) {
      newErrors.cgpa = "CGPA must be between 0 and 10";
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrollmentNumber: formData.enrollmentNumber,
        branch: formData.branch,
        backlogCount: parseInt(formData.backlogCount, 10) || 0,
      };

      if (formData.cgpa) {
        payload.cgpa = parseFloat(formData.cgpa);
      }

      payload.mobileNumber = formData.mobileNumber;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Registration failed" });
        return;
      }

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setErrors({ general: loginData.error || "Login failed after registration. Please sign in." });
        return;
      }

      if (loginData.token) {
        localStorage.setItem("token", loginData.token);
      }

      setAuth({
        user: { name: loginData.name || formData.name, email: formData.email },
        role: loginData.role,
      });

      toast.success("Login successful");
      router.push("/student/dashboard");
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                  errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                  errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Enrollment Number *
            </label>
            <input
              id="enrollmentNumber"
              name="enrollmentNumber"
              type="text"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                errors.enrollmentNumber ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="EN12345678"
            />
            {errors.enrollmentNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.enrollmentNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                errors.branch ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {errors.branch && <p className="mt-1 text-sm text-red-600">{errors.branch}</p>}
          </div>

          <div>
            <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700 mb-2">
              CGPA (Optional)
            </label>
            <input
              id="cgpa"
              name="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={formData.cgpa}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                errors.cgpa ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="8.5"
            />
            {errors.cgpa && <p className="mt-1 text-sm text-red-600">{errors.cgpa}</p>}
          </div>

          <div>
            <label htmlFor="backlogCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Backlogs (Optional)
            </label>
            <input
              id="backlogCount"
              name="backlogCount"
              type="number"
              min="0"
              max="10"
              value={formData.backlogCount}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">Enter 0 if you have no backlogs</p>
          </div>

          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number *
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                errors.mobileNumber ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="9876543210"
              maxLength="10"
            />
            {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter 10-digit mobile number</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
