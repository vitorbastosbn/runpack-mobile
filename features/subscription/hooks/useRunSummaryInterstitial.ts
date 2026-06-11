import { useEffect } from 'react';
import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { useSubscriptionStore } from '@store/subscription.store';
import { AD_UNIT_INTERSTITIAL } from '@constants/monetization';

/** Mostra intersticial uma única vez ao abrir o resumo pós-corrida (free only). */
export function useRunSummaryInterstitial() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const { isLoaded, load, show } = useInterstitialAd(AD_UNIT_INTERSTITIAL);

  useEffect(() => {
    if (!isPremium) load();
  }, [isPremium, load]);

  useEffect(() => {
    if (!isPremium && isLoaded) show();
  }, [isPremium, isLoaded, show]);
}
