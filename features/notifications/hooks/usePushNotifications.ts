import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useAuthStore } from '@store/auth.store';
import { notificationsService } from '../services/notifications.service';

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerToken();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // foreground: displayed by handler set in _layout
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Backend sends { deepLink: "runpack://..." } in data payload
      const url = (response.notification.request.content.data?.deepLink
        ?? response.notification.request.content.data?.url) as string | undefined;
      if (url) handleDeepLink(url);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
}

async function registerToken() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const projectId = process.env.EXPO_PUBLIC_EXPO_PROJECT_ID;
  if (!projectId) return;

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await notificationsService.registerPushToken(token.data);
  } catch {
    // best-effort
  }
}

function handleDeepLink(url: string) {
  const path = url.replace('runpack://', '');
  if (path.startsWith('invite/')) {
    router.push(`/invite/${path.slice(7)}`);
  } else if (path.startsWith('groups/')) {
    // Session started notification — navigate to group so user can join
    const groupId = path.slice(7);
    router.push(`/(tabs)/groups/${groupId}`);
  } else if (path.startsWith('sessions/')) {
    // Active session or run result
    router.push('/(modal)/live-session');
  } else if (path.startsWith('runs/')) {
    router.push(`/(tabs)/history/${path.slice(5)}`);
  } else if (path === 'friends/requests') {
    router.push('/(tabs)/friends/requests');
  } else if (path === 'friends') {
    router.push('/(tabs)/friends');
  } else if (path === 'achievements') {
    router.push('/achievements');
  }
}
