"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import StudentFiltersForm from "@/components/admin/dashboard/StudentFiltersForm";
import StudentApplicationsTable from "@/components/admin/dashboard/StudentApplicationsTable";

export default function StudentFiltersPanel({
  applications,
  companies,
  branches,
  loading,
  onExport,
}) {
  const [filters, setFilters] = useState({
    companyId: "",
    status: "",
    branch: "",
    minCgpa: "",
    maxBacklogCount: "",
    enrollmentSearch: "",
  });

  const filteredApplications = useMemo(() => {
    let data = applications || [];

    if (filters.companyId) {
      data = data.filter(
        (app) => String(app.companyId?._id || app.companyId) === filters.companyId
      );
    }

    if (filters.status) {
      data = data.filter((app) => app.status === filters.status);
    }

    if (filters.branch) {
      data = data.filter(
        (app) => (app.studentId?.branch || app.snapshot?.branch) === filters.branch
      );
    }

    if (filters.minCgpa) {
      const min = Number(filters.minCgpa);
      if (!Number.isNaN(min)) {
        data = data.filter((app) => {
          const cgpa = app.studentId?.cgpa ?? app.snapshot?.cgpa;
          return typeof cgpa === "number" ? cgpa >= min : false;
        });
      }
    }

    if (filters.maxBacklogCount !== "") {
      const max = Number(filters.maxBacklogCount);
      if (!Number.isNaN(max)) {
        data = data.filter((app) => {
          const count = app.studentId?.backlogCount ?? app.snapshot?.backlogCount ?? 0;
          return count <= max;
        });
      }
    }

    if (filters.enrollmentSearch) {
      const q = filters.enrollmentSearch.toLowerCase();
      data = data.filter((app) =>
        (app.studentId?.enrollmentNumber || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [applications, filters]);

  const resetFilters = () => {
    setFilters({
      companyId: "",
      status: "",
      branch: "",
      minCgpa: "",
      maxBacklogCount: "",
      enrollmentSearch: "",
    });
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card title="Student Filters" subtitle="Filter applications by student and company">
      <StudentFiltersForm
        filters={filters}
        companies={companies}
        branches={branches}
        totalCount={filteredApplications.length}
        onChange={updateFilter}
        onReset={resetFilters}
        onExport={() => onExport?.(filters.companyId)}
      />

      <div className="mt-4">
        <StudentApplicationsTable data={filteredApplications} loading={loading} />
      </div>
    </Card>
  );
}
