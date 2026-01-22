// services/student.api.js
import api from "@/lib/axios";

export const getStudentApplications = () => api.get("/student/applications");

export const getStudentDashboard = () => api.get("/student/dashboard");

export const getStudentProfile = () => api.get("/student/profile");

export const updateStudentProfile = (data) => api.put("/student/profile", data);

export const uploadResume = (formData) =>
  api.post("/student/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const applyToCompany = (companyId) =>
  api.post(`/student/apply/${companyId}`);

export const getCompanies = () => api.get("/companies");
