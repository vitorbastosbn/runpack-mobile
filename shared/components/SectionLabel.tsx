import { Text, TouchableOpacity, View } from 'react-native';

interface SectionLabelProps {
  label: string;
  action?: string;
  onAction?: () => void;
}

/** Overline de seção — única hierarquia de título dentro das telas. */
export function SectionLabel({ label, action, onAction }: SectionLabelProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text
        className="text-text-secondary text-[11px] font-semibold uppercase"
        style={{ letterSpacing: 1.4 }}
      >
        {label}
      </Text>
      {action && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text className="text-brand-primary text-[13px] font-semibold">{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
