import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  jwt: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  setAuth: (user: User, jwt: string) => void;
  clearAuth: () => void;
  setRestoring: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  jwt: null,
  isAuthenticated: false,
  isRestoring: true,
  setAuth: (user, jwt) => set({ user, jwt, isAuthenticated: true, isRestoring: false }),
  clearAuth: () => set({ user: null, jwt: null, isAuthenticated: false, isRestoring: false }),
  setRestoring: (value) => set({ isRestoring: value }),
}));
