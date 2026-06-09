import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@store/auth.store';
import { profileService } from '../services/profile.service';

export function useWeeklyStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  return useQuery({
    queryKey: ['profile', 'weekly-stats'],
    queryFn: () => profileService.getWeeklyStats(),
    enabled: isAuthenticated && !isRestoring,
  });
}
