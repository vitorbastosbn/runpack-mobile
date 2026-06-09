import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@store/auth.store';
import { achievementsService } from '../services/achievements.service';

export function useMyAchievements() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsService.getMyAchievements(),
    enabled: isAuthenticated && !isRestoring,
  });
}
