"use client";

import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white animate-scale-in">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">
          Ready to Get Started?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Join hundreds of students and streamline your campus placement journey today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-xl text-sm sm:text-base"
          >
            Create Account
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-all hover:scale-105 border-2 border-white/20 text-sm sm:text-base"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
