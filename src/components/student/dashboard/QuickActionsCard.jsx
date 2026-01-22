"use client";

import Card from "@/components/ui/Card";

export default function QuickActionsCard({ onBrowseCompanies, onUpdateProfile, onViewApplications }) {
  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <button
          onClick={onBrowseCompanies}
          className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 hover:scale-105 group"
        >
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-2 block group-hover:scale-110 transition-transform">🏢</span>
            <p className="font-medium text-gray-900 text-sm sm:text-base">Browse Companies</p>
          </div>
        </button>

        <button
          onClick={onUpdateProfile}
          className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 hover:scale-105 group"
        >
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-2 block group-hover:scale-110 transition-transform">👤</span>
            <p className="font-medium text-gray-900 text-sm sm:text-base">Update Profile</p>
          </div>
        </button>

        <button
          onClick={onViewApplications}
          className="flex items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 hover:scale-105 group sm:col-span-2 lg:col-span-1"
        >
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-2 block group-hover:scale-110 transition-transform">📋</span>
            <p className="font-medium text-gray-900 text-sm sm:text-base">My Applications</p>
          </div>
        </button>
      </div>
    </Card>
  );
}
