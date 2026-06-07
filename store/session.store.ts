import { create } from 'zustand';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'reconnecting' | 'error';

interface RankingEntry {
  userId: string;
  username: string;
  rank: number;
  distanceM: number;
  paceSKm: number;
}

interface SessionState {
  sessionId: string | null;
  status: SessionStatus;
  ranking: RankingEntry[];
  elapsedMs: number;
  distanceM: number;
  paceSKm: number;
  setSession: (sessionId: string) => void;
  setStatus: (status: SessionStatus) => void;
  updateRanking: (ranking: RankingEntry[]) => void;
  updateTelemetry: (data: { elapsedMs: number; distanceM: number; paceSKm: number }) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  status: 'idle',
  ranking: [],
  elapsedMs: 0,
  distanceM: 0,
  paceSKm: 0,
  setSession: (sessionId) => set({ sessionId }),
  setStatus: (status) => set({ status }),
  updateRanking: (ranking) => set({ ranking }),
  updateTelemetry: (data) => set(data),
  clearSession: () => set({ sessionId: null, status: 'idle', ranking: [], elapsedMs: 0, distanceM: 0, paceSKm: 0 }),
}));
