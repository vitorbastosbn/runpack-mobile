export interface RunSummary {
  sessionId: string;
  groupId: string | null;
  groupName: string | null;
  startedAt: string;
  finishedAt: string;
  totalDistanceM: number;
  totalTimeMs: number;
  avgPaceSkm: number;
  finalRank: number;
  totalParticipants: number;
}

export interface RunParticipantResult {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  totalDistanceM: number;
  totalTimeMs: number;
  avgPaceSkm: number;
  finalRank: number;
}

export interface RunDetail {
  sessionId: string;
  groupId: string | null;
  groupName: string | null;
  startedAt: string;
  finishedAt: string;
  myResult: RunParticipantResult;
  participants: RunParticipantResult[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}
