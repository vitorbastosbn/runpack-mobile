import { create } from 'zustand';

export type Plan = 'free' | 'premium';

interface SubscriptionState {
  plan: Plan;
  isPremium: boolean;
  planExpiresAt: string | null;
  setPlan: (plan: Plan, planExpiresAt: string | null) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  plan: 'free',
  isPremium: false,
  planExpiresAt: null,
  setPlan: (plan, planExpiresAt) => set({ plan, isPremium: plan === 'premium', planExpiresAt }),
  reset: () => set({ plan: 'free', isPremium: false, planExpiresAt: null }),
}));
