"use client";

import AdminLayout from "@/components/layouts/AdminLayout";
import CreateCompanyForm from "@/components/admin/CreateCompanyForm";

export default function AdminCreateCompanyPage() {
  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create Company
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Add a new company opening
          </p>
        </div>

        <CreateCompanyForm />
      </div>
    </AdminLayout>
  );
}
