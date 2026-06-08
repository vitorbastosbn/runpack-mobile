import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useAuthStore } from '@store/auth.store';
import { useCreateSession } from '@features/sessions/hooks/useCreateSession';

export default function HomeScreen() {
  const { logout } = useLogout();
  const user = useAuthStore((s) => s.user);
  const { createSession, isLoading } = useCreateSession();

  const resetOnboarding = async () => {
    await SecureStore.deleteItemAsync('onboarding_completed');
    await logout();
  };

  return (
    <View className="flex-1 bg-surface-bg px-8 pt-16">
      <View className="mb-8">
        <Text className="text-text-primary text-2xl font-bold">Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</Text>
        {user && (
          <Text className="text-text-secondary text-sm mt-1">@{user.username}</Text>
        )}
      </View>

      {/* Start run FAB */}
      <TouchableOpacity
        className="w-full bg-brand-primary rounded-2xl py-5 items-center flex-row justify-center gap-3 mb-4"
        onPress={() => createSession()}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="flash" size={22} color="#fff" />
            <Text className="text-white font-bold text-base">Iniciar corrida</Text>
          </>
        )}
      </TouchableOpacity>

      <View className="gap-3 mt-auto mb-4">
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
    </View>
  );
}
