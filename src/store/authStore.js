// store/authStore.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  token: null,
  setAuth: (data) => set(data),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, role: null, token: null });
  },
}));
