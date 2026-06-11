import { useEffect, useRef } from 'react';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

/**
 * Política Google: MobileAds.initialize() só após o fluxo de consent (UMP).
 * Roda uma única vez por sessão do app.
 */
export function useAdsInit() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function init() {
      try {
        await AdsConsent.requestInfoUpdate();
        await AdsConsent.loadAndShowConsentFormIfRequired();
        await mobileAds().initialize();
      } catch {
        // Sem consent / sem rede: ads simplesmente não carregam nesta sessão
      }
    }

    init();
  }, []);
}
