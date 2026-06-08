import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);

  if (isRestoring) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!onboardingCompleted) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(tabs)/home" />;
}
