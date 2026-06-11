import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@store/subscription.store';

export function useSubscription() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const planExpiresAt = useSubscriptionStore((s) => s.planExpiresAt);
  const router = useRouter();

  const openPaywall = useCallback(() => {
    router.push('/(modal)/paywall');
  }, [router]);

  return { isPremium, planExpiresAt, openPaywall };
}
