import '../global.css';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@shared/utils/queryClient';
import { useSessionRestore } from '@features/auth/hooks/useSessionRestore';
import { usePushNotifications } from '@features/notifications/hooks/usePushNotifications';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function AppInit() {
  useSessionRestore();
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(onboarding)/welcome" />
        <Stack.Screen name="(onboarding)/permissions" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modal)/live-session" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(modal)/run-summary" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="invite/[token]" />
        <Stack.Screen name="invite/invalid" />
        <Stack.Screen name="achievements" />
      </Stack>
    </QueryClientProvider>
  );
}
