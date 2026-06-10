import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  cta?: string;
  onPress?: () => void;
  /** true = bloco solto centralizado (listas); false = dentro de card. */
  card?: boolean;
}

export function EmptyState({ icon, title, subtitle, cta, onPress, card = false }: EmptyStateProps) {
  const content = (
    <>
      <View className="w-14 h-14 rounded-full bg-surface-elevated items-center justify-center mb-4">
        <Ionicons name={icon} size={24} color={colors.text.disabled} />
      </View>
      <Text className="text-text-primary text-[15px] font-semibold text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-text-secondary text-[13px] text-center mt-1 leading-5">{subtitle}</Text>
      ) : null}
      {cta && onPress ? (
        <TouchableOpacity
          className="bg-brand-primary rounded-full px-6 py-2.5 mt-5"
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text className="text-white text-sm font-bold">{cta}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  if (card) {
    return <View className="bg-surface-card rounded-[20px] px-6 py-8 items-center">{content}</View>;
  }
  return <View className="items-center px-10 mt-16">{content}</View>;
}
