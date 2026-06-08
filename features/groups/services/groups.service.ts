import { http } from '@shared/utils/http';
import type { Group, GroupMember } from '../types';

interface CreateGroupPayload { name: string; description?: string; imageUrl?: string }
interface UpdateGroupPayload { name?: string; description?: string; imageUrl?: string }

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    const { data } = await http.get<Group[]>('/groups');
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

  async removeMember(groupId: string, userId: string): Promise<void> {
    await http.delete(`/groups/${groupId}/members/${userId}`);
  },

  async updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<GroupMember> {
    const { data } = await http.patch<GroupMember>(`/groups/${groupId}/members/${userId}`, { role });
    return data;
  },
};
