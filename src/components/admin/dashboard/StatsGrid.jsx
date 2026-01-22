"use client";

import Card from "@/components/ui/Card";

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 animate-scale-in">
      <Card className="hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
              {stats?.totalStudents || 0}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 ml-2">
            <span className="text-xl sm:text-2xl">🎓</span>
          </div>
        </div>
      </Card>

      <Card className="hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Companies</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
              {stats?.totalCompanies || 0}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 ml-2">
            <span className="text-xl sm:text-2xl">🏢</span>
          </div>
        </div>
      </Card>

      <Card className="hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Applications</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
              {stats?.totalApplications || 0}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0 ml-2">
            <span className="text-xl sm:text-2xl">📝</span>
          </div>
        </div>
      </Card>

      <Card className="hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Placed Students</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">
              {stats?.placedStudents || 0}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0 ml-2">
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
