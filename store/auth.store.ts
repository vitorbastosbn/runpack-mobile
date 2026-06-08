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
  onboardingCompleted: boolean;
  setAuth: (user: User, jwt: string, onboardingCompleted: boolean) => void;
  clearAuth: () => void;
  setRestoring: (value: boolean) => void;
  setOnboardingCompleted: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  jwt: null,
  isAuthenticated: false,
  isRestoring: true,
  onboardingCompleted: false,
  setAuth: (user, jwt, onboardingCompleted) =>
    set({ user, jwt, isAuthenticated: true, isRestoring: false, onboardingCompleted }),
  clearAuth: () =>
    set({ user: null, jwt: null, isAuthenticated: false, isRestoring: false, onboardingCompleted: false }),
  setRestoring: (value) => set({ isRestoring: value }),
  setOnboardingCompleted: (value) => set({ onboardingCompleted: value }),
}));
