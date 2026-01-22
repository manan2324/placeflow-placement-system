"use client";

import Input from "@/components/ui/Input";

export default function CompanyFieldsGrid({ createData, createErrors, onFieldChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Company Name *"
        value={createData.name}
        onChange={(e) => onFieldChange("name", e.target.value)}
        error={createErrors.name}
        placeholder="Acme Corp"
      />

      <Input
        label="Role *"
        value={createData.role}
        onChange={(e) => onFieldChange("role", e.target.value)}
        error={createErrors.role}
        placeholder="Software Engineer"
      />

      <Input
        label="CTC (LPA) *"
        type="number"
        step="0.01"
        min="0"
        value={createData.ctc}
        onChange={(e) => onFieldChange("ctc", e.target.value)}
        error={createErrors.ctc}
        placeholder="12"
      />

      <Input
        label="Min CGPA *"
        type="number"
        step="0.01"
        min="0"
        max="10"
        value={createData.minCgpa}
        onChange={(e) => onFieldChange("minCgpa", e.target.value)}
        error={createErrors.minCgpa}
        placeholder="7.00"
      />
    </div>
  );
}
