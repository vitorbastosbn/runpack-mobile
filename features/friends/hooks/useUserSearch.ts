import { useQuery } from '@tanstack/react-query';
import { friendsService } from '../services/friends.service';

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => friendsService.searchUsers(query),
    enabled: query.trim().length >= 2,
    staleTime: 10_000,
  });
}
