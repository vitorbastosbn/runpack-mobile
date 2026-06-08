import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['profile', 'weekly-stats'],
    queryFn: () => profileService.getWeeklyStats(),
  });
}
