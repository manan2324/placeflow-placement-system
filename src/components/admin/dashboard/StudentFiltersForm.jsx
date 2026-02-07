"use client";

import { useMemo } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function StudentFiltersForm({
  filters,
  companies,
  branches,
  totalCount,
  onChange,
  onToggle,
  onReset,
  onExport,
}) {
  // Generate years dynamically from 2018 to current year
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2018; // Start year when system was established
    const yearList = [];
    for (let year = startYear; year <= currentYear; year++) {
      yearList.push(year);
    }
    return yearList;
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Company Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <select
            value={filters.companyId}
            onChange={(e) => onChange("companyId", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition border-gray-300"
          >
            <option value="">All Companies</option>
            {(companies || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition border-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">APPLIED</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="SELECTED">SELECTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Branch Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch {filters.branch.length > 0 && <span className="text-indigo-600 font-semibold">({filters.branch.length} selected)</span>}
          </label>
          <div className="border rounded-lg p-3 bg-linear-to-br from-gray-50 to-white">
            <div className="flex flex-wrap gap-2">
              {(branches || []).map((b) => {
                const isSelected = filters.branch.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onToggle("branch", b)}
                    className={`
                      px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
                      border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      ${isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'
                      }
                    `}
                  >
                    {isSelected && (
                      <span className="inline-block mr-1">✓</span>
                    )}
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Input
          label="Min CGPA"
          type="number"
          step="0.01"
          min="0"
          max="10"
          value={filters.minCgpa}
          onChange={(e) => onChange("minCgpa", e.target.value)}
          placeholder="7.0"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Backlog Count</label>
          <input
            type="number"
            min="0"
            max="10"
            value={filters.maxBacklogCount}
            onChange={(e) => onChange("maxBacklogCount", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition border-gray-300"
            placeholder="Filter by backlog count"
          />
          <p className="mt-1 text-xs text-gray-500">Shows students with backlogs ≤ this value</p>
        </div>

        <Input
          label="Enrollment Number"
          value={filters.enrollmentSearch}
          onChange={(e) => onChange("enrollmentSearch", e.target.value)}
          placeholder="EN123456"
        />

        {/* Year of Selection Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year of Selection</label>
          <select
            value={filters.yearOfSelection}
            onChange={(e) => onChange("yearOfSelection", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition border-gray-300"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Filter by year when student applied</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing {totalCount} applications</div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onReset}>
            Reset Filters
          </Button>
          <Button variant="primary" onClick={onExport} disabled={totalCount === 0}>
            Export CSV
          </Button>
        </div>
      </div>
    </>
  );
}
