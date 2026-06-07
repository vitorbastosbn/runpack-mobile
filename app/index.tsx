import { Redirect } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!user?.username) return <Redirect href="/(onboarding)/username" />;
  return <Redirect href="/(tabs)/home" />;
}
