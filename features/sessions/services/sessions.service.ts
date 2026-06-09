import { http } from '@shared/utils/http';
import type { SessionItem, SessionDetail } from '../types';

export const sessionsService = {
  async createSession(groupId?: string, distanceGoalM?: number | null): Promise<SessionItem> {
    const { data } = await http.post('/sessions', {
      groupId: groupId ?? null,
      distanceGoalM: distanceGoalM ?? null,
    });
    return data;
  },

  async joinSession(sessionId: string): Promise<SessionItem> {
    const { data } = await http.post(`/sessions/${sessionId}/join`);
    return data;
  },

  async getSession(sessionId: string): Promise<SessionDetail> {
    const { data } = await http.get(`/sessions/${sessionId}`);
    return data;
  },

  async finishSession(
    sessionId: string,
    stats?: { elapsedMs: number; distanceM: number; paceSKm: number },
  ): Promise<SessionDetail> {
    const { data } = await http.post(`/sessions/${sessionId}/finish`, stats ?? null);
    return data;
  },

  async leaveSession(sessionId: string): Promise<void> {
    await http.delete(`/sessions/${sessionId}/participants/me`);
  },
};
