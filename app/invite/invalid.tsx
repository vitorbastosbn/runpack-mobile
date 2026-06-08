import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InvalidInviteScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-surface-bg items-center justify-center px-8">
      <Ionicons name="link-outline" size={56} color="#3F3F46" />
      <Text className="text-text-primary text-xl font-bold mt-6">Link inválido</Text>
      <Text className="text-text-secondary text-center mt-2">
        Este convite não existe, já foi utilizado ou expirou.
      </Text>
      <TouchableOpacity
        className="mt-8 bg-surface-card border border-surface-border rounded-xl px-6 py-3"
        onPress={() => router.replace('/(tabs)/home')}
      >
        <Text className="text-text-primary font-semibold">Ir para o início</Text>
      </TouchableOpacity>
    </View>
  );
}
