"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function StudentFiltersForm({
  filters,
  companies,
  branches,
  totalCount,
  onChange,
  onReset,
  onExport,
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
          <select
            value={filters.branch}
            onChange={(e) => onChange("branch", e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition border-gray-300"
          >
            <option value="">All Branches</option>
            {(branches || []).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
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
          <Button variant="primary" onClick={onExport} disabled={!filters.companyId}>
            Export CSV
          </Button>
        </div>
      </div>
    </>
  );
}
