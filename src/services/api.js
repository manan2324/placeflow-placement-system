// services/api.js
import api from "@/lib/axios";

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};
