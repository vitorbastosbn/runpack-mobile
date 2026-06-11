import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSubscriptionStore } from '@store/subscription.store';
import { AD_UNIT_BANNER } from '@constants/monetization';

/** Banner fixo de rodapé. Premium: não renderiza nada. */
export function AdBanner() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  if (isPremium) return null;

  return (
    <View className="items-center bg-surface-bg">
      <BannerAd unitId={AD_UNIT_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
