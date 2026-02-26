"use client";

import Card from "@/components/ui/Card";

export default function StatusOverview({ statusCounts }) {
  const counts = statusCounts || {};

  return (
    <Card title="Application Status Overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">{counts.APPLIED || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Applied</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{counts.SHORTLISTED || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Shortlisted</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-green-600">{counts.SELECTED || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Selected</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
          <p className="text-lg sm:text-2xl font-bold text-red-600">{counts.REJECTED || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Rejected</p>
        </div>
      </div>
    </Card>
  );
}
