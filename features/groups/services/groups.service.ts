import { http } from '@shared/utils/http';
import type { Page } from '@shared/types/pagination';
import type { Group, GroupMember, GroupLastRun, GroupRunSummary } from '../types';

interface CreateGroupPayload { name: string; description?: string; imageUrl?: string }
interface UpdateGroupPayload { name?: string; description?: string; imageUrl?: string }

export const groupsService = {
  async getGroups(page = 0, size = 10, q?: string): Promise<Page<Group>> {
    const params: Record<string, string | number> = { page, size };
    if (q && q.trim()) params.q = q.trim();
    const { data } = await http.get<Page<Group>>('/groups', { params });
    return data;
  },

  async createGroup(payload: CreateGroupPayload): Promise<Group> {
    const { data } = await http.post<Group>('/groups', payload);
    return data;
  },

  async getGroup(id: string): Promise<Group> {
    const { data } = await http.get<Group>(`/groups/${id}`);
    return data;
  },

  async updateGroup(id: string, payload: UpdateGroupPayload): Promise<Group> {
    const { data } = await http.patch<Group>(`/groups/${id}`, payload);
    return data;
  },

  async deleteGroup(id: string): Promise<void> {
    await http.delete(`/groups/${id}`);
  },

  async getMembers(id: string): Promise<GroupMember[]> {
    const { data } = await http.get<GroupMember[]>(`/groups/${id}/members`);
    return data;
  },

  // Top 3 of the group's last finished run. Backend returns 204 (no content) when none.
  async getLastRun(id: string): Promise<GroupLastRun | null> {
    const res = await http.get<GroupLastRun>(`/groups/${id}/last-run`);
    return res.status === 204 ? null : res.data;
  },

  async getRuns(id: string): Promise<GroupRunSummary[]> {
    const { data } = await http.get<GroupRunSummary[]>(`/groups/${id}/runs`);
    return data;
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    await http.delete(`/groups/${groupId}/members/${userId}`);
  },

  async updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<GroupMember> {
    const { data } = await http.patch<GroupMember>(`/groups/${groupId}/members/${userId}`, { role });
    return data;
  },
};
