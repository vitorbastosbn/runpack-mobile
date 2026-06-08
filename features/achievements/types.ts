export interface UserAchievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string | null;
  sessionId: string | null;
  unlockedAt: string;
}
