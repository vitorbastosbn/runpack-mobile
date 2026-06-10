import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGoogleLogin } from '@features/auth/hooks/useLogin';

export default function LoginScreen() {
  const { login, isLoading, error } = useGoogleLogin();

  return (
    <View className="flex-1 bg-surface-bg px-8 justify-between pb-16">
      {/* Wordmark — centered in the upper two thirds */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-text-primary text-5xl font-extrabold tracking-tighter">
          RunPack<Text className="text-brand-primary">.</Text>
        </Text>
        <Text
          className="text-text-secondary text-[13px] font-semibold uppercase mt-3"
          style={{ letterSpacing: 4 }}
        >
          Corre Pace
        </Text>
      </View>

      <View>
        <TouchableOpacity
          className="w-full bg-white rounded-2xl py-4 px-6 items-center justify-center"
          onPress={login}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#0A0A0C" />
          ) : (
            <Text className="text-[#0A0A0C] font-bold text-base">Continuar com Google</Text>
          )}
        </TouchableOpacity>

        {error && <Text className="text-status-error text-sm mt-4 text-center">{error}</Text>}
      </View>
    </View>
  );
}
