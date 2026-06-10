import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-brand-primary',
  secondary: 'bg-surface-card',
  ghost: 'bg-transparent',
  danger: 'bg-surface-card',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-text-primary',
  ghost: 'text-text-secondary',
  danger: 'text-status-error',
};

const ICON_COLOR: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: colors.text.primary,
  ghost: colors.text.secondary,
  danger: colors.status.error,
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      className={`w-full rounded-2xl py-4 flex-row items-center justify-center gap-2 ${CONTAINER[variant]} ${
        inactive && variant === 'primary' ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={ICON_COLOR[variant]} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={ICON_COLOR[variant]} />}
          <Text className={`font-bold text-base ${LABEL[variant]}`}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Espaço vertical padrão entre botões empilhados. */
export function ButtonStack({ children }: { children: React.ReactNode }) {
  return <View className="gap-3">{children}</View>;
}
