import { useCallback, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/auth.store';
import { authService } from '../services/auth.service';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const login = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error('Token não recebido do Google');

      const authResponse = await authService.socialLogin('google', idToken);
      await authService.saveJwt(authResponse.jwt);

      setAuth(
        {
          id: authResponse.userId,
          email: authResponse.email,
          name: '',
          username: authResponse.username ?? '',
          avatarUrl: null,
        },
        authResponse.jwt,
      );

      if (authResponse.isNewUser || !authResponse.username) {
        router.replace('/(onboarding)/username');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === statusCodes.SIGN_IN_CANCELLED) return;
        if (code === statusCodes.IN_PROGRESS) return;
      }
      setError(err instanceof Error ? err.message : 'Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [setAuth, router]);

  return { login, isLoading, error };
}
