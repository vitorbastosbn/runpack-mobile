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
