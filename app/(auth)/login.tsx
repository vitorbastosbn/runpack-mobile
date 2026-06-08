import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGoogleLogin } from '@features/auth/hooks/useLogin';

export default function LoginScreen() {
  const { login, isLoading, error } = useGoogleLogin();

  return (
    <View className="flex-1 bg-surface-bg items-center justify-center px-8">
      <Text className="text-text-primary text-4xl font-bold tracking-tight">RunPack</Text>
      <Text className="text-brand-primary text-base mt-1 mb-16">Corre Pace</Text>

      <TouchableOpacity
        className="w-full bg-surface-card border border-surface-border rounded-xl py-4 px-6 flex-row items-center justify-center"
        onPress={login}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#F97316" />
        ) : (
          <Text className="text-text-primary font-semibold text-base">
            Continuar com Google
          </Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-status-error text-sm mt-4 text-center">{error}</Text>
      )}
    </View>
  );
}
