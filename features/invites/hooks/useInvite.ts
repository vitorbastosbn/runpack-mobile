import { useQuery, useMutation } from '@tanstack/react-query';
import { invitesService } from '../services/invites.service';

export function useInviteInfo(token: string) {
  return useQuery({
    queryKey: ['invite', token],
    queryFn: () => invitesService.getInviteInfo(token),
    retry: false,
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (token: string) => invitesService.acceptInvite(token),
  });
}
