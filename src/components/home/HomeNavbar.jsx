"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from 'lucide-react';

export default function HomeNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-xl">PF</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900">PlaceFlow</span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 md:space-x-4">
          <Link
            href="/auth/login"
            className="text-sm md:text-base text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="text-sm md:text-base px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden mt-4 space-y-2 animate-fade-in">
          <Link
            href="/auth/login"
            className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="block px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
