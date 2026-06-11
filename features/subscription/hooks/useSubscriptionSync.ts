import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/auth.store';
import { useSubscriptionStore } from '@store/subscription.store';
import { setPremiumErrorListener } from '@shared/utils/http';
import { subscriptionService } from '../services/subscription.service';

/**
 * Configura o RevenueCat com o userId (app_user_id = UUID do User, usado pelo
 * webhook no backend) e sincroniza o plano: entitlement local primeiro
 * (instantâneo), depois o backend como fonte de verdade.
 */
export function useSubscriptionSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setPlan = useSubscriptionStore((s) => s.setPlan);
  const reset = useSubscriptionStore((s) => s.reset);
  const router = useRouter();

  // Erros 403 com código premium (GROUP_LIMIT_REACHED etc.) abrem a Paywall.
  useEffect(() => {
    setPremiumErrorListener(() => router.push('/(modal)/paywall'));
    return () => setPremiumErrorListener(null);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      reset();
      subscriptionService.logOut();
      return;
    }

    let cancelled = false;

    async function sync() {
      try {
        subscriptionService.configure(userId as string);
        const info = await subscriptionService.getCustomerInfo();
        if (!cancelled && subscriptionService.hasPremiumEntitlement(info)) {
          setPlan('premium', null);
        }
        const backend = await subscriptionService.fetchBackendPlan();
        if (!cancelled) setPlan(backend.plan, backend.planExpiresAt);
      } catch {
        // Sem rede / RevenueCat fora: mantém último estado conhecido
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId, setPlan, reset]);
}
