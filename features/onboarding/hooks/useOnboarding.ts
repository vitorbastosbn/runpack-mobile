import { useCallback, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

const ONBOARDING_KEY = 'onboarding_completed';

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted);
  const router = useRouter();

  const requestPermissionsAndFinish = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        Notifications.requestPermissionsAsync(),
        Location.requestForegroundPermissionsAsync(),
      ]);
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      setOnboardingCompleted(true);
      router.replace('/(tabs)/home');
    } finally {
      setIsLoading(false);
    }
  }, [setOnboardingCompleted, router]);

  return { requestPermissionsAndFinish, isLoading };
}
