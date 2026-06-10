import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Quando presente, renderiza o cabeçalho de navegação (seta + título compacto). */
  onBack?: () => void;
  right?: React.ReactNode;
}

/**
 * Cabeçalho padrão: raiz (título grande) ou navegação (voltar + título compacto).
 * Mantém o mesmo padding em todas as telas.
 */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  if (onBack) {
    return (
      <View className="px-5 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onBack}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-surface-card items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-text-primary text-[17px] font-bold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    );
  }

  return (
    <View className="px-5 pt-14 pb-4 flex-row items-end justify-between">
      <View className="flex-1 mr-4">
        {subtitle ? <Text className="text-text-secondary text-sm mb-0.5">{subtitle}</Text> : null}
        <Text className="text-text-primary text-[28px] font-extrabold tracking-tight" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}
