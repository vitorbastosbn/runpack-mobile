import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '../services/groups.service';

export const GROUPS_KEY = ['groups'];
const groupKey = (id: string) => ['groups', id];
const membersKey = (id: string) => ['groups', id, 'members'];

export function useGroups() {
  return useQuery({ queryKey: GROUPS_KEY, queryFn: groupsService.getGroups });
}

export function useGroup(id: string) {
  return useQuery({ queryKey: groupKey(id), queryFn: () => groupsService.getGroup(id) });
}

export function useGroupMembers(id: string) {
  return useQuery({ queryKey: membersKey(id), queryFn: () => groupsService.getMembers(id) });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: groupsService.createGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GROUPS_KEY }),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsService.deleteGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GROUPS_KEY }),
  });
}

export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => groupsService.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKey(groupId) });
    },
  });
}

export function useUpdateMemberRole(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'member' }) =>
      groupsService.updateMemberRole(groupId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey(groupId) }),
  });
}
