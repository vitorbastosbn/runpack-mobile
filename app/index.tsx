import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);

  useEffect(() => {
    if (isRestoring) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!onboardingCompleted) {
      router.replace('/(onboarding)/welcome');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isRestoring, isAuthenticated, onboardingCompleted]);

  return (
    <View className="flex-1 bg-surface-bg items-center justify-center">
      <ActivityIndicator color="#FF5A1F" size="large" />
    </View>
  );
}
