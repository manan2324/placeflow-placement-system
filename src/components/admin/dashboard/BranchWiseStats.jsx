"use client";

import Card from "@/components/ui/Card";

export default function BranchWiseStats({ branchWiseStats }) {
  console.log(branchWiseStats);
  return (
    <Card title="Branch-wise Statistics">
      {branchWiseStats && branchWiseStats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {branchWiseStats.map((item) => (
            <div key={item.branch} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-base sm:text-lg text-gray-900">{item.branch}</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Applications: {item.totalApplications}
              </p>
              <p className="text-xs sm:text-sm text-green-600 font-medium">
                Selected: {item.placed}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No data available</p>
      )}
    </Card>
  );
}
