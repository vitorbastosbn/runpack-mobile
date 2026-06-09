export type GroupRole = 'admin' | 'member';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  memberCount: number;
  myRole: GroupRole;
  createdAt: string;
  activeSessionId: string | null;
}

export interface GroupMember {
  memberId: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: GroupRole;
  joinedAt: string;
}
