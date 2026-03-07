// src/hooks/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAuthenticated: false,

      setAuth: (token, username) => {
        localStorage.setItem('shopen_token', token);
        set({ token, username, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('shopen_token');
        set({ token: null, username: null, isAuthenticated: false });
      },
    }),
    { name: 'shopen_auth' }
  )
);
