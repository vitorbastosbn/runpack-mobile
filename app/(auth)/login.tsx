import { View, Text } from 'react-native';

// Feature spec: docs/features/00-authentication.md
// Implementation: features/auth/
export default function LoginScreen() {
  return (
    <View className="flex-1 bg-surface-bg items-center justify-center">
      <Text className="text-text-primary text-2xl font-bold">RunPack</Text>
      <Text className="text-text-secondary mt-2">Login — a implementar</Text>
    </View>
  );
}
