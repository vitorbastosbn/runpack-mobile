import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@store/auth.store';
import { useSessionStore } from '@store/session.store';
import { sessionsService } from '@features/sessions/services/sessions.service';
import { ACTIVE_RUNS_KEY } from '@features/sessions/hooks/useActiveRuns';
import { GROUPS_KEY } from '@features/groups/hooks/useGroups';
import { notificationsService } from '../services/notifications.service';
import { routePushDeepLink } from '../utils/pushDeepLink';
import { resolveExpoProjectId } from '../utils/pushProject';

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const setSession = useSessionStore((s) => s.setSession);
  const queryClient = useQueryClient();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerToken();

    const getLink = (data?: Record<string, unknown> | null): string | undefined =>
      (data?.deepLink ?? data?.url) as string | undefined;

    // A group run starting (runpack://sessions/{id}) or finishing (runpack://runs/{id})
    // changes the home "corridas em andamento" list — refresh groups so it stays live.
    const refreshActiveRunsIfRelevant = (data?: Record<string, unknown> | null) => {
      const link = getLink(data);
      if (link && (link.startsWith('runpack://sessions/') || link.startsWith('runpack://runs/'))) {
        queryClient.invalidateQueries({ queryKey: ACTIVE_RUNS_KEY });
        queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
      }
    };

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      refreshActiveRunsIfRelevant(data);
      const url = getLink(data);
      if (url) {
        routePushDeepLink(url, {
          joinSession: sessionsService.joinSession,
          setSession,
          push: (href) => router.push(href as Parameters<typeof router.push>[0]),
        })
          .then(() => Notifications.clearLastNotificationResponse())
          .catch((error) => console.warn('[push] deep link failed:', error));
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      handleResponse(lastResponse);
    }

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      // Foreground receipt: keep home's active-runs list in sync.
      refreshActiveRunsIfRelevant(n.request.content.data as Record<string, unknown> | undefined);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleResponse);

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, setSession, queryClient]);
}

async function registerToken() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'RunPack',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff7a1a',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const finalStatus = existingStatus === 'granted'
    ? existingStatus
    : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== 'granted') {
    console.warn('[push] permission not granted:', finalStatus);
    return;
  }

  const projectId = resolveExpoProjectId(
    process.env.EXPO_PUBLIC_EXPO_PROJECT_ID,
    Constants.easConfig?.projectId,
    Constants.expoConfig?.extra?.eas?.projectId,
  );
  if (!projectId) {
    console.warn('[push] missing Expo projectId. EXPO_PUBLIC_EXPO_PROJECT_ID must be EAS project UUID, not package name.');
    return;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await notificationsService.registerPushToken(token.data);
    console.log('[push] token registered');
  } catch (error) {
    console.warn('[push] token registration failed:', error);
  }
}
