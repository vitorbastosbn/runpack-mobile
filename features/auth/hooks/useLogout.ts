import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '@store/auth.store';
import { queryClient } from '@shared/utils/queryClient';
import { authService } from '../services/auth.service';

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const logout = useCallback(async () => {
    await Promise.allSettled([
      authService.clearJwt(),
      GoogleSignin.signOut(),
    ]);
    clearAuth();
    queryClient.clear();
    router.replace('/(auth)/login');
  }, [clearAuth, router]);

  return { logout };
}
