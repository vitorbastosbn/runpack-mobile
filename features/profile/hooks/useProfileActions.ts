import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLogout } from '@features/auth/hooks/useLogout';
import { profileService } from '../services/profile.service';

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => profileService.updateUsername(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

export function useDeleteAccount() {
  const { logout } = useLogout();

  return useMutation({
    mutationFn: () => profileService.deleteAccount(),
    onSuccess: () => logout(),
  });
}
