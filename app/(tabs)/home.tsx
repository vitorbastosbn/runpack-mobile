import { View, Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useAuthStore } from '@store/auth.store';

export default function HomeScreen() {
  const { logout } = useLogout();
  const user = useAuthStore((s) => s.user);

  const resetOnboarding = async () => {
    await SecureStore.deleteItemAsync('onboarding_completed');
    await logout();
  };

  return (
    <View className="flex-1 bg-surface-bg items-center justify-center px-8 gap-4">
      <Text className="text-text-primary text-2xl font-bold">Home</Text>
      {user && (
        <Text className="text-text-secondary text-sm">{user.username}</Text>
      )}

      <TouchableOpacity
        className="w-full bg-surface-card border border-surface-border rounded-xl py-3 items-center"
        onPress={logout}
        activeOpacity={0.8}
      >
        <Text className="text-text-primary font-semibold">Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full border border-status-warning rounded-xl py-3 items-center"
        onPress={resetOnboarding}
        activeOpacity={0.8}
      >
        <Text className="text-status-warning font-semibold">Resetar Onboarding (dev)</Text>
      </TouchableOpacity>
    </View>
  );
}
