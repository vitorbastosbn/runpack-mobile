import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '../services/groups.service';
import type { Page } from '@shared/types/pagination';
import type { Group } from '../types';

export const GROUPS_KEY = ['groups'];
const groupKey = (id: string) => ['groups', id];
const membersKey = (id: string) => ['groups', id, 'members'];

// Home preview: first page only, flattened to an array via select.
export function useGroups() {
  return useQuery({
    queryKey: ['groups', 'preview'],
    queryFn: () => groupsService.getGroups(0, 10),
    select: (page) => page.content,
  });
}

// Groups list screen: infinite scroll + optional name search.
export function useGroupsInfinite(q: string) {
  return useInfiniteQuery<Page<Group>, Error>({
    queryKey: ['groups', 'infinite', q],
    queryFn: ({ pageParam = 0 }) => groupsService.getGroups(pageParam as number, 10, q),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    initialPageParam: 0,
  });
}

export function useGroup(id: string) {
  return useQuery({ queryKey: groupKey(id), queryFn: () => groupsService.getGroup(id) });
}

export function useGroupMembers(id: string) {
  return useQuery({ queryKey: membersKey(id), queryFn: () => groupsService.getMembers(id) });
}

export function useGroupLastRun(id: string) {
  return useQuery({
    queryKey: ['groups', id, 'last-run'],
    queryFn: () => groupsService.getLastRun(id),
  });
}

export function useGroupRuns(id: string) {
  return useQuery({
    queryKey: ['groups', id, 'runs'],
    queryFn: () => groupsService.getRuns(id),
  });
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
      queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
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
