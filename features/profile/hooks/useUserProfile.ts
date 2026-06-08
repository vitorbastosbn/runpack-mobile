import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getUserById(userId),
    enabled: !!userId,
  });
}
