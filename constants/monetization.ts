import { TestIds } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';

/** Entitlement configurado no painel do RevenueCat. */
export const PREMIUM_ENTITLEMENT = 'premium';

export const REVENUECAT_API_KEY: string =
  Constants.expoConfig?.extra?.revenueCatApiKey ?? '';

/**
 * IDs de bloco de anúncio. Em dev usa os TestIds oficiais do Google.
 * Produção: substituir pelos unit IDs reais criados no painel AdMob.
 */
export const AD_UNIT_BANNER = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-REPLACE/banner';
export const AD_UNIT_INTERSTITIAL = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-REPLACE/interstitial';
