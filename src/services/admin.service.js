// services/admin.service.js
import api from "@/lib/axios";

export const getAdminDashboard = () => api.get("/admin/dashboard");

export const getApplications = (params) => api.get("/admin/applications", { params });

export const updateApplicationStatus = (id, status) =>
  api.patch(`/admin/applications/${id}/status`, { status });

export const getCompanies = () => api.get("/admin/companies");

export const createCompany = (payload) => api.post("/admin/companies", payload);

// Closes a company (OPEN -> CLOSED). Backend currently does not support re-opening.
export const updateCompanyStatus = (id) => api.patch(`/admin/companies/${id}/status`);

export const exportApplications = (companyId) =>
  api.get(`/admin/export/applications/${companyId}`, {
    responseType: "blob",
  });

// Admin: List all students
export const getStudents = () => api.get("/admin/students");

// Admin: Delete a student (requires password confirmation)
export const deleteStudent = (id, password) => 
  api.delete(`/admin/students/${id}`, { data: { password } });

// Admin: List all application logs
export const getApplicationLogs = () => api.get("/admin/application-logs");

// Admin: Get student profile update requests
export const getStudentRequests = (status) => {
  const params = status && status !== 'all' ? { status } : {};
  return api.get("/admin/student-requests", { params });
};

// Admin: Approve student profile update request
export const approveStudentRequest = (requestId) =>
  api.put(`/admin/student-requests/${requestId}`, { action: 'approve' });

// Admin: Reject student profile update request
export const rejectStudentRequest = (requestId, rejectionReason) =>
  api.put(`/admin/student-requests/${requestId}`, { action: 'reject', rejectionReason });
