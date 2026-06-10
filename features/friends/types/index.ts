export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type FriendshipRelation = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export interface FriendUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export interface Friendship {
  id: string;
  user: FriendUser;
  status: FriendshipStatus;
  favorite: boolean;
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  friendshipId: string | null;
  relation: FriendshipRelation;
  favorite: boolean;
}
