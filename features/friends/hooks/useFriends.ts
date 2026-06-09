import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsService } from '../services/friends.service';
import type { Page } from '@shared/types/pagination';
import type { Friendship } from '../types';

export const FRIENDS_KEY = ['friends'];
export const REQUESTS_KEY = ['friends', 'requests'];
export const SENT_KEY = ['friends', 'sent'];

// Friends list: infinite scroll.
export function useFriends() {
  return useInfiniteQuery<Page<Friendship>, Error>({
    queryKey: FRIENDS_KEY,
    queryFn: ({ pageParam = 0 }) => friendsService.getFriends(pageParam as number),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    initialPageParam: 0,
  });
}

// Received requests: infinite scroll (used by the requests screen).
export function useFriendRequests() {
  return useInfiniteQuery<Page<Friendship>, Error>({
    queryKey: REQUESTS_KEY,
    queryFn: ({ pageParam = 0 }) => friendsService.getPendingRequests(pageParam as number),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    initialPageParam: 0,
  });
}

// Lightweight count for the notifications badge — first page only, uses totalElements.
export function useFriendRequestsCount() {
  return useQuery({
    queryKey: [...REQUESTS_KEY, 'count'],
    queryFn: () => friendsService.getPendingRequests(0, 1),
    select: (page) => page.totalElements,
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: SENT_KEY,
    queryFn: friendsService.getSentRequests,
  });
}

export function useFriendActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
    queryClient.invalidateQueries({ queryKey: SENT_KEY });
    queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
  };

  const sendRequest = useMutation({
    mutationFn: (addresseeId: string) => friendsService.sendRequest(addresseeId),
    onSuccess: invalidate,
  });

  const acceptRequest = useMutation({
    mutationFn: (id: string) => friendsService.updateFriendship(id, 'accepted'),
    onSuccess: invalidate,
  });

  const rejectRequest = useMutation({
    mutationFn: (id: string) => friendsService.updateFriendship(id, 'rejected'),
    onSuccess: invalidate,
  });

  const removeFriend = useMutation({
    mutationFn: (id: string) => friendsService.deleteFriendship(id),
    onSuccess: invalidate,
  });

  return { sendRequest, acceptRequest, rejectRequest, removeFriend };
}
