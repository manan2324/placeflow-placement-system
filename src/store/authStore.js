// store/authStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      setAuth: (data) => set(data),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, role: null, token: null });
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        role: state.role 
      }), // only persist user and role, not token (token is in localStorage separately)
    }
  )
);
