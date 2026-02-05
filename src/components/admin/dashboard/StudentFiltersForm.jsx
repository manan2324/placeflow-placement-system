"use client";

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
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Company Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company {filters.companyId.length > 0 && `(${filters.companyId.length})`}
          </label>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-white">
            {(companies || []).map((c) => (
              <label key={c._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.companyId.includes(c._id)}
                  onChange={() => onToggle("companyId", c._id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{c.name}</span>
              </label>
            ))}
            {(!companies || companies.length === 0) && (
              <p className="text-sm text-gray-500">No companies available</p>
            )}
          </div>
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
            Branch {filters.branch.length > 0 && `(${filters.branch.length})`}
          </label>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-white">
            {(branches || []).map((b) => (
              <label key={b} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.branch.includes(b)}
                  onChange={() => onToggle("branch", b)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{b}</span>
              </label>
            ))}
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
