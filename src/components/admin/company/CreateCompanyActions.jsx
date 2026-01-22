"use client";

import Button from "@/components/ui/Button";

export default function CreateCompanyActions({ creating, onCancel }) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" disabled={creating}>
        {creating ? "Creating…" : "Create Company"}
      </Button>
    </div>
  );
}
