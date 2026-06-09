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

export interface PodiumEntry {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  totalDistanceM: number;
  finalRank: number;
}

export interface GroupLastRun {
  sessionId: string;
  finishedAt: string;
  podium: PodiumEntry[];
}

export interface GroupRunSummary {
  sessionId: string;
  finishedAt: string;
  participantCount: number;
  distanceGoalM: number | null;
  winnerName: string | null;
  winnerUsername: string | null;
  winnerAvatarUrl: string | null;
  winnerDistanceM: number | null;
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
