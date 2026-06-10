import { http } from '@shared/utils/http';
import type { Page } from '@shared/types/pagination';
import type { Friendship, UserSearchResult } from '../types';

export const friendsService = {
  async getFriends(page = 0, size = 10): Promise<Page<Friendship>> {
    const { data } = await http.get<Page<Friendship>>('/friendships', { params: { page, size } });
    return data;
  },

  async getPendingRequests(page = 0, size = 10): Promise<Page<Friendship>> {
    const { data } = await http.get<Page<Friendship>>('/friendships/requests', { params: { page, size } });
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

  async updateFavorite(id: string, favorite: boolean): Promise<Friendship> {
    const { data } = await http.patch<Friendship>(`/friendships/${id}/favorite`, { favorite });
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
