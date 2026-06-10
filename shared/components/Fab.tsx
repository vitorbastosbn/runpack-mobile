import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

interface FabProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  loading?: boolean;
  accessibilityLabel: string;
}

/** Botão de ação flutuante — squircle laranja, único ponto de cor da tela. */
export function Fab({ icon, onPress, loading, accessibilityLabel }: FabProps) {
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 24,
        right: 20,
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 10,
      }}
      className="w-16 h-16 bg-brand-primary rounded-[22px] items-center justify-center"
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name={icon} size={26} color="#fff" />}
    </TouchableOpacity>
  );
}
