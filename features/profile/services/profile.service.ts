import { http } from '@shared/utils/http';
import type { UserProfile, WeeklyStatsEntry } from '../types';

export const profileService = {
  async getMe(): Promise<UserProfile> {
    const { data } = await http.get('/users/me');
    return data;
  },

  async getUserById(userId: string): Promise<UserProfile> {
    const { data } = await http.get(`/users/${userId}`);
    return data;
  },

  async getWeeklyStats(): Promise<WeeklyStatsEntry[]> {
    const { data } = await http.get('/users/me/stats', { params: { period: '8w' } });
    return data;
  },
};
