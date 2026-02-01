"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import CompanyFieldsGrid from "@/components/admin/company/CompanyFieldsGrid";
import EligibleBranchesSelector from "@/components/admin/company/EligibleBranchesSelector";
import DeadlineBacklogFields from "@/components/admin/company/DeadlineBacklogFields";
import CreateCompanyActions from "@/components/admin/company/CreateCompanyActions";

import { createCompany } from "@/services/admin.service";

export default function CreateCompanyForm({ onCreated, showCard = true }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [createData, setCreateData] = useState({
    name: "",
    role: "",
    ctc: "",
    eligibleBranches: [],
    minCgpa: "",
    backlogCount: 0,
    applicationDeadline: "",
  });

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "CHE"];

  const toggleBranch = (branch) => {
    setCreateData((prev) => {
      const has = prev.eligibleBranches.includes(branch);
      return {
        ...prev,
        eligibleBranches: has
          ? prev.eligibleBranches.filter((b) => b !== branch)
          : [...prev.eligibleBranches, branch],
      };
    });
    if (createErrors.eligibleBranches) {
      setCreateErrors((prev) => ({ ...prev, eligibleBranches: "" }));
    }
  };

  const validateCreate = () => {
    const e = {};

    if (!createData.name || createData.name.trim().length < 1)
      e.name = "Company name is required";
    if (!createData.role || createData.role.trim().length < 1)
      e.role = "Role is required";

    const ctcNum = Number(createData.ctc);
    if (Number.isNaN(ctcNum) || ctcNum < 0) e.ctc = "CTC must be a number ≥ 0";

    const cgpaNum = Number(createData.minCgpa);
    if (Number.isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)
      e.minCgpa = "Min CGPA must be between 0 and 10";

    if (!Array.isArray(createData.eligibleBranches) || createData.eligibleBranches.length === 0) {
      e.eligibleBranches = "Select at least one eligible branch";
    }

    if (!createData.applicationDeadline) {
      e.applicationDeadline = "Application deadline is required";
    } else {
      const dt = new Date(createData.applicationDeadline);
      if (Number.isNaN(dt.getTime())) {
        e.applicationDeadline = "Invalid deadline";
      } else if (dt <= new Date()) {
        e.applicationDeadline = "Deadline must be in the future";
      }
    }

    setCreateErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;

    setCreating(true);
    try {
      const payload = {
        name: createData.name.trim(),
        role: createData.role.trim(),
        ctc: Number(createData.ctc),
        eligibleBranches: createData.eligibleBranches,
        minCgpa: Number(createData.minCgpa),
        backlogCount: Number(createData.backlogCount),
        applicationDeadline: createData.applicationDeadline,
      };

      await createCompany(payload);

      setCreateData({
        name: "",
        role: "",
        ctc: "",
        eligibleBranches: [],
        minCgpa: "",
        backlogCount: 0,
        applicationDeadline: "",
      });
      setCreateErrors({});

      if (onCreated) {
        onCreated();
      } else {
        router.push("/admin/companies");
      }
    } catch (error) {
      const message =
        error?.response?.data?.error || error?.message || "Failed to create company";
      setCreateErrors({ general: message });
    } finally {
      setCreating(false);
    }
  };

  const content = (
    <form onSubmit={handleCreateCompany} className="space-y-4">
      {createErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {createErrors.general}
        </div>
      )}
      <CompanyFieldsGrid
        createData={createData}
        createErrors={createErrors}
        onFieldChange={(field, value) =>
          setCreateData((prev) => ({ ...prev, [field]: value }))
        }
      />

      <EligibleBranchesSelector
        branches={branches}
        selected={createData.eligibleBranches}
        error={createErrors.eligibleBranches}
        onToggle={toggleBranch}
      />

      <DeadlineBacklogFields
        applicationDeadline={createData.applicationDeadline}
        backlogCount={createData.backlogCount}
        error={createErrors.applicationDeadline}
        onDeadlineChange={(value) =>
          setCreateData((prev) => ({ ...prev, applicationDeadline: value }))
        }
        onBacklogChange={(value) =>
          setCreateData((prev) => ({ ...prev, backlogCount: value }))
        }
      />

      <CreateCompanyActions creating={creating} onCancel={() => router.push("/admin/companies")} />
    </form>
  );

  if (!showCard) return content;

  return (
    <Card title="Create Company" subtitle="Add a new company opening">
      {content}
    </Card>
  );
}
