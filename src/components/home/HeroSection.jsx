"use client";

import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-slide-up">
        <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-4 animate-bounce-soft">
          🎓 Welcome to PlaceFlow
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight px-4 sm:px-0">
          Streamline Your
          <span className="text-indigo-600"> Campus Placements</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-6">
          A comprehensive platform for managing student placements, company registrations,
          and application tracking. Everything you need in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-4 sm:px-0">
          <button
            onClick={() => router.push("/auth/register")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all hover:scale-105 hover:shadow-xl text-sm sm:text-base"
          >
            Register as Student
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all hover:scale-105 text-sm sm:text-base"
          >
            Admin Login
          </button>
        </div>
      </div>
    </section>
  );
}
