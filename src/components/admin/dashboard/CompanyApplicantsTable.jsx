"use client";

import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";

export default function CompanyApplicantsTable({ companyStats, onExport }) {
  return (
    <Card title="Company-wise Applicants" subtitle="Applicants and selected counts per company">
      {companyStats && companyStats.length > 0 ? (
        <Table
          columns={[
            { key: "companyName", label: "Company" },
            { key: "applicants", label: "Applicants" },
            { key: "selected", label: "Selected" },
            {
              key: "export",
              label: "Export",
              render: (row) => (
                <Button
                  variant="secondary"
                  className="text-xs py-1 px-2"
                  onClick={() => onExport?.(row.companyId)}
                >
                  Export CSV
                </Button>
              ),
            },
          ]}
          data={companyStats}
          loading={false}
        />
      ) : (
        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No company stats available</p>
      )}
    </Card>
  );
}
