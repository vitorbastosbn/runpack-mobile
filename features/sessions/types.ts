export interface SessionItem {
  id: string;
  groupId: string | null;
  groupName: string | null;
  status: 'active' | 'finished';
  startedAt: string;
  joinedAt: string;
  finishedAt: string | null;
  participantCount: number;
  isParticipant: boolean;
  distanceGoalM: number | null;
}

export interface SessionParticipant {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  joinedAt: string;
  leftAt: string | null;
}

export interface SessionDetail {
  id: string;
  groupId: string | null;
  groupName: string | null;
  status: 'active' | 'finished';
  startedAt: string;
  finishedAt: string | null;
  participants: SessionParticipant[];
}

export interface ActiveRun {
  sessionId: string;
  groupId: string | null;
  groupName: string | null;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
  participantCount: number;
  startedAt: string;
}

export interface RankingEntry {
  userId: string;
  username: string;
  avatarUrl: string | null;
  rank: number;
  distanceM: number;
  paceSKm: number;
  elapsedMs: number;
}

export type WsStatus = 'connecting' | 'connected' | 'reconnecting' | 'error';
