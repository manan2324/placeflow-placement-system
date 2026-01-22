"use client";

import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";

export default function StudentApplicationsTable({ data, loading }) {
  return (
    <Table
      columns={[
        {
          key: "student",
          label: "Student",
          render: (row) => row.studentId?.enrollmentNumber || "—",
        },
        {
          key: "branch",
          label: "Branch",
          render: (row) => row.studentId?.branch || row.snapshot?.branch || "—",
        },
        {
          key: "cgpa",
          label: "CGPA",
          render: (row) => {
            const cgpa = row.studentId?.cgpa ?? row.snapshot?.cgpa;
            return typeof cgpa === "number" ? cgpa.toFixed(2) : "—";
          },
        },
        {
          key: "backlog",
          label: "Backlog",
          render: (row) => {
            const flag = row.studentId?.hasBacklog ?? row.snapshot?.hasBacklog;
            return flag ? "Yes" : "No";
          },
        },
        {
          key: "company",
          label: "Company",
          render: (row) => row.companyId?.name || "—",
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <Badge
              variant={
                row.status === "SELECTED"
                  ? "success"
                  : row.status === "REJECTED"
                  ? "danger"
                  : row.status === "SHORTLISTED"
                  ? "info"
                  : "warning"
              }
            >
              {row.status}
            </Badge>
          ),
        },
        {
          key: "appliedAt",
          label: "Applied",
          render: (row) => (row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : "—"),
        },
      ]}
      data={data}
      loading={loading}
    />
  );
}
