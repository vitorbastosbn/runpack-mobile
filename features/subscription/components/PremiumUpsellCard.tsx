import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';
import { useSubscription } from '../hooks/useSubscription';

interface PremiumUpsellCardProps {
  title: string;
  subtitle: string;
}

export function PremiumUpsellCard({ title, subtitle }: PremiumUpsellCardProps) {
  const { openPaywall } = useSubscription();

  return (
    <Pressable
      onPress={openPaywall}
      className="bg-surface-card rounded-2xl p-5 flex-row items-center gap-4"
      accessibilityRole="button"
    >
      <View className="w-11 h-11 rounded-full bg-brand-primary/10 items-center justify-center">
        <Ionicons name="lock-closed" size={18} color={colors.brand.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-bold text-[15px]">{title}</Text>
        <Text className="text-text-secondary text-[13px] leading-5 mt-0.5">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} />
    </Pressable>
  );
}
