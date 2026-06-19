"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import { GraduationCap, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loginType, setLoginType] = useState("STUDENT");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "ACCOUNT_PENDING_APPROVAL" || data.errorCode === "ACCOUNT_PENDING_APPROVAL") {
          setErrors({ pendingApproval: data.message || "Your account is pending admin approval. We will notify you via email once approved." });
        } else {
          setErrors({ general: data.message || "Email or Password is incorrect" });
        }
        return;
      }

      if (data.role !== loginType) {
        setErrors({
          general: `This is ${data.role === "ADMIN" ? "an Admin" : "a Student"} account. Please select the correct login type.`,
        });
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Fetch complete user data after successful login
      try {
        const userResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setAuth({ user: userData.user, role: data.role });
        } else {
          // Fallback if fetching user data fails
          setAuth({ user: { email: formData.email }, role: data.role });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Fallback if fetching user data fails
        setAuth({ user: { email: formData.email }, role: data.role });
      }

      toast.success("Login successful");

      if (data.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 animate-scale-in">
      <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setLoginType("STUDENT")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            loginType === "STUDENT" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center justify-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Student Login
          </span>
        </button>
        <button
          type="button"
          onClick={() => setLoginType("ADMIN")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            loginType === "ADMIN" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 mr-2" />
            Admin Login
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
            {errors.general}
          </div>
        )}

        {errors.pendingApproval && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Account Pending Approval</p>
            <p>{errors.pendingApproval}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:scale-[1.01] outline-none transition-all duration-200 ${
              errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:scale-[1.01] outline-none transition-all duration-200 ${
                errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:scale-[1.03] active:scale-95 transition-all duration-200"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          <div className="flex justify-end mt-1">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline transition-all duration-200"
            >
              Forgot Password?
            </Link>
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
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-all duration-200"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
