import { View, Text } from 'react-native';

export function PremiumBadge() {
  return (
    <View className="bg-brand-primary/15 border border-brand-primary rounded-full px-2.5 py-0.5">
      <Text
        className="text-brand-primary text-[10px] font-bold uppercase"
        style={{ letterSpacing: 1 }}
      >
        Premium
      </Text>
    </View>
  );
}
