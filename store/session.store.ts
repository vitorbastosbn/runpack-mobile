import { create } from 'zustand';
import type { RankingEntry, WsStatus } from '@features/sessions/types';

interface SessionState {
  sessionId: string | null;
  joinedAt: number | null; // epoch ms — used for elapsed timer
  status: WsStatus;
  isCreator: boolean;
  groupId: string | null;
  groupName: string | null;
  ranking: RankingEntry[];
  elapsedMs: number;
  distanceM: number;
  paceSKm: number;
  setSession: (sessionId: string, joinedAt: number, isCreator: boolean, groupId?: string | null, groupName?: string | null) => void;
  setStatus: (status: WsStatus) => void;
  updateRanking: (ranking: RankingEntry[]) => void;
  updateTelemetry: (data: { elapsedMs: number; distanceM: number; paceSKm: number }) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  joinedAt: null,
  status: 'connecting',
  isCreator: false,
  groupId: null,
  groupName: null,
  ranking: [],
  elapsedMs: 0,
  distanceM: 0,
  paceSKm: 0,
  setSession: (sessionId, joinedAt, isCreator, groupId = null, groupName = null) =>
    set({ sessionId, joinedAt, isCreator, groupId, groupName }),
  setStatus: (status) => set({ status }),
  updateRanking: (ranking) => set({ ranking }),
  updateTelemetry: (data) => set(data),
  clearSession: () => set({
    sessionId: null,
    joinedAt: null,
    status: 'connecting',
    isCreator: false,
    groupId: null,
    groupName: null,
    ranking: [],
    elapsedMs: 0,
    distanceM: 0,
    paceSKm: 0,
  }),
}));
