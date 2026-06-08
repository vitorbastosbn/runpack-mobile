import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@store/auth.store';
import { authService } from '../services/auth.service';

const ONBOARDING_KEY = 'onboarding_completed';

interface JwtPayload {
  sub: string;
  email: string;
  username?: string;
  exp: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload + '=='.slice((payload.length % 4) || 4);
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function useSessionRestore() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    async function restore() {
      const [jwt, onboardingFlag] = await Promise.all([
        authService.getJwt(),
        SecureStore.getItemAsync(ONBOARDING_KEY),
      ]);

      if (!jwt) {
        clearAuth();
        return;
      }

      const payload = decodeJwtPayload(jwt);
      if (!payload || payload.exp < Date.now() / 1000) {
        await authService.clearJwt();
        clearAuth();
        return;
      }

      setAuth(
        {
          id: payload.sub,
          email: payload.email,
          name: '',
          username: payload.username ?? '',
          avatarUrl: null,
        },
        jwt,
        onboardingFlag === 'true',
      );
    }

    restore();
  }, [setAuth, clearAuth]);
}
