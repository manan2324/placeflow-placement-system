"use client";
import { UserPlus } from 'lucide-react';

export default function RegisterHeader() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
        <UserPlus className="h-8 w-8 text-white" />
      </div>
      <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
      <p className="mt-2 text-sm text-gray-600">Join PlaceFlow - Your placement management platform</p>
    </div>
  );
}
