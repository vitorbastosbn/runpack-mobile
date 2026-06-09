import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@store/auth.store';
import { achievementsService } from '../services/achievements.service';

export function useSessionAchievements(sessionId: string, enabled: boolean) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  return useQuery({
    queryKey: ['achievements', 'session', sessionId],
    queryFn: () => achievementsService.getSessionAchievements(sessionId),
    enabled: enabled && !!sessionId && isAuthenticated && !isRestoring,
  });
}
