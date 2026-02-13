"use client";
import { Lock } from 'lucide-react';

export default function LoginHeader() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-bounce-soft">
        <Lock className="h-8 w-8 text-white" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900 animate-fade-in-delay-1">Welcome Back</h2>
      <p className="mt-2 text-sm text-gray-600 animate-fade-in-delay-2">Sign in to PlaceFlow</p>
    </div>
  );
}
