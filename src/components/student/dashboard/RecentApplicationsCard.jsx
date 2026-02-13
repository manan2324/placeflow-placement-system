"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Inbox } from 'lucide-react';

export default function RecentApplicationsCard({ applications, onBrowseCompanies, onOpenApplication, onViewAll }) {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      SHORTLISTED: "info",
      SELECTED: "success",
      REJECTED: "danger",
    };
    return colors[status] || "default";
  };

  return (
    <Card title="Recent Applications" subtitle="Your latest application submissions">
      {!applications || applications.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Inbox className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
          <p className="text-gray-500 text-base sm:text-lg mb-3 sm:mb-4">No applications yet</p>
          <button
            onClick={onBrowseCompanies}
            className="px-4 sm:px-6 py-2 bg-indigo-600 text-white text-sm sm:text-base rounded-lg hover:bg-indigo-700 transition-all hover:scale-105"
          >
            Browse Companies
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer gap-3 sm:gap-0"
              onClick={() => onOpenApplication?.(app._id)}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{app.companyName}</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
            </div>
          ))}

          <button
            onClick={onViewAll}
            className="w-full py-2 text-sm sm:text-base text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View All Applications →
          </button>
        </div>
      )}
    </Card>
  );
}
