import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { http } from '@shared/utils/http';
import { PREMIUM_ENTITLEMENT, REVENUECAT_API_KEY } from '@constants/monetization';
import type { Plan } from '@store/subscription.store';

interface MePlanResponse {
  plan: Plan;
  planExpiresAt: string | null;
}

export const subscriptionService = {
  /** app_user_id = UUID do User — o webhook do backend resolve o usuário por ele. */
  configure(userId: string): void {
    Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
  },

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch {
      // SDK não configurado ainda — ignorar
    }
  },

  hasPremiumEntitlement(info: CustomerInfo): boolean {
    return info.entitlements.active[PREMIUM_ENTITLEMENT] != null;
  },

  async getCustomerInfo(): Promise<CustomerInfo> {
    return Purchases.getCustomerInfo();
  },

  async getMonthlyPackage(): Promise<PurchasesPackage | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.monthly ?? null;
  },

  async purchase(pkg: PurchasesPackage): Promise<CustomerInfo> {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  },

  async restore(): Promise<CustomerInfo> {
    return Purchases.restorePurchases();
  },

  /** Plano do backend — fonte de verdade para enforcement. */
  async fetchBackendPlan(): Promise<MePlanResponse> {
    const { data } = await http.get('/users/me');
    return { plan: (data.plan ?? 'free') as Plan, planExpiresAt: data.planExpiresAt ?? null };
  },
};
