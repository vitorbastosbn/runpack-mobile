import { http } from '@shared/utils/http';
import type { NotificationPreferences } from '../types';

export const notificationsService = {
  async registerPushToken(token: string): Promise<void> {
    await http.post('/users/me/push-token', { token, platform: 'android' });
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const { data } = await http.get('/users/me/notification-preferences');
    return data;
  },

  async updateNotificationPreference(
    key: keyof NotificationPreferences,
    value: boolean
  ): Promise<NotificationPreferences> {
    const { data } = await http.patch('/users/me/notification-preferences', { [key]: value });
    return data;
  },
};
