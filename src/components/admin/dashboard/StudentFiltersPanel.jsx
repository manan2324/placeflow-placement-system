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
  onFilteredExport,
}) {
  const [filters, setFilters] = useState({
    companyId: "",
    status: "",
    branch: [],
    minCgpa: "",
    maxBacklogCount: "",
    enrollmentSearch: "",
    yearOfSelection: "",
  });

  const filteredApplications = useMemo(() => {
    let data = applications || [];

    if (filters.companyId) {
      data = data.filter((app) =>
        String(app.companyId?._id || app.companyId) === filters.companyId
      );
    }

    if (filters.status) {
      data = data.filter((app) => app.status === filters.status);
    }

    if (filters.branch.length > 0) {
      data = data.filter((app) =>
        filters.branch.includes(app.studentId?.branch || app.snapshot?.branch)
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

    if (filters.yearOfSelection) {
      const selectedYear = Number(filters.yearOfSelection);
      data = data.filter((app) => {
        const appliedDate = app.appliedAt;
        if (!appliedDate) return false;
        const year = new Date(appliedDate).getFullYear();
        return year === selectedYear;
      });
    }

    return data;
  }, [applications, filters]);

  const resetFilters = () => {
    setFilters({
      companyId: "",
      status: "",
      branch: [],
      minCgpa: "",
      maxBacklogCount: "",
      enrollmentSearch: "",
      yearOfSelection: "",
    });
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFilterItem = (field, value) => {
    setFilters((prev) => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  return (
    <Card>
      <StudentFiltersForm
        filters={filters}
        companies={companies}
        branches={branches}
        totalCount={filteredApplications.length}
        onChange={updateFilter}
        onToggle={toggleFilterItem}
        onReset={resetFilters}
        onExport={() => onFilteredExport?.(filters)}
      />

      <div className="mt-4">
        <StudentApplicationsTable data={filteredApplications} loading={loading} />
      </div>
    </Card>
  );
}
