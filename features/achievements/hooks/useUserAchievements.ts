import { useQuery } from '@tanstack/react-query';
import { achievementsService } from '../services/achievements.service';

export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: ['achievements', 'user', userId],
    queryFn: () => achievementsService.getUserAchievements(userId),
    enabled: !!userId,
  });
}
