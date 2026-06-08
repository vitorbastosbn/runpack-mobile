import { useQuery } from '@tanstack/react-query';
import { achievementsService } from '../services/achievements.service';

export function useSessionAchievements(sessionId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['achievements', 'session', sessionId],
    queryFn: () => achievementsService.getSessionAchievements(sessionId),
    enabled: enabled && !!sessionId,
  });
}
