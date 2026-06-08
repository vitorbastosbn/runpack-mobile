export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  totalRuns: number;
  totalDistanceM: number;
  bestPaceSkm: number;
  createdAt: string;
}

export interface WeeklyStatsEntry {
  weekStart: string;
  totalDistanceM: number;
  totalRuns: number;
}
