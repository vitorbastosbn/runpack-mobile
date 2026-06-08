import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsService } from '../services/friends.service';

export const FRIENDS_KEY = ['friends'];
export const REQUESTS_KEY = ['friends', 'requests'];
export const SENT_KEY = ['friends', 'sent'];

export function useFriends() {
  return useQuery({
    queryKey: FRIENDS_KEY,
    queryFn: friendsService.getFriends,
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: REQUESTS_KEY,
    queryFn: friendsService.getPendingRequests,
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
