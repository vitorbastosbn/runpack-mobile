import { useQuery } from '@tanstack/react-query';
import { achievementsService } from '../services/achievements.service';

export function useMyAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementsService.getMyAchievements(),
  });
}
