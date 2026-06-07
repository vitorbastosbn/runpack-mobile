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
  setAuth: (user: User, jwt: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  jwt: null,
  isAuthenticated: false,
  setAuth: (user, jwt) => set({ user, jwt, isAuthenticated: true }),
  clearAuth: () => set({ user: null, jwt: null, isAuthenticated: false }),
}));
