import { http } from '@shared/utils/http';
import type { Friendship, UserSearchResult } from '../types';

export const friendsService = {
  async getFriends(): Promise<Friendship[]> {
    const { data } = await http.get<Friendship[]>('/friendships');
    return data;
  },

  async getPendingRequests(): Promise<Friendship[]> {
    const { data } = await http.get<Friendship[]>('/friendships/requests');
    return data;
  },

  async getSentRequests(): Promise<Friendship[]> {
    const { data } = await http.get<Friendship[]>('/friendships/sent');
    return data;
  },

  async sendRequest(addresseeId: string): Promise<Friendship> {
    const { data } = await http.post<Friendship>('/friendships', { addresseeId });
    return data;
  },

  async updateFriendship(id: string, status: 'accepted' | 'rejected'): Promise<Friendship> {
    const { data } = await http.patch<Friendship>(`/friendships/${id}`, { status });
    return data;
  },

  async deleteFriendship(id: string): Promise<void> {
    await http.delete(`/friendships/${id}`);
  },

  async searchUsers(q: string): Promise<UserSearchResult[]> {
    const { data } = await http.get<UserSearchResult[]>('/users/search', { params: { q } });
    return data;
  },
};
