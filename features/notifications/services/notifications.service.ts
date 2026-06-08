import { http } from '@shared/utils/http';

export const notificationsService = {
  async registerPushToken(token: string): Promise<void> {
    await http.post('/users/me/push-token', { token, platform: 'android' });
  },
};
