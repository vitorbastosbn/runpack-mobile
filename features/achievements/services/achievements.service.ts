import { http } from '@shared/utils/http';
import type { UserAchievement } from '../types';

export const achievementsService = {
  async getMyAchievements(): Promise<UserAchievement[]> {
    const { data } = await http.get('/users/me/achievements');
    return data;
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data } = await http.get(`/users/${userId}/achievements`);
    return data;
  },

  async getSessionAchievements(sessionId: string): Promise<UserAchievement[]> {
    const { data } = await http.get('/users/me/achievements');
    return (data as UserAchievement[]).filter((a) => a.sessionId === sessionId);
  },
};
