import { View, Text, TouchableOpacity } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

export default function InvalidInviteScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-surface-bg items-center justify-center px-8">
      <View className="w-16 h-16 rounded-full bg-surface-card items-center justify-center">
        <Ionicons name="link-outline" size={28} color={colors.text.disabled} />
      </View>
      <Text className="text-text-primary text-xl font-extrabold tracking-tight mt-6">Link inválido</Text>
      <Text className="text-text-secondary text-center mt-2">
        Este convite não existe, já foi utilizado ou expirou.
      </Text>
      <TouchableOpacity
        className="mt-8 bg-surface-card rounded-full px-6 py-3"
        onPress={() => router.replace('/(tabs)/home')}
      >
        <Text className="text-text-primary font-semibold">Ir para o início</Text>
      </TouchableOpacity>
      <AdBanner />
    </View>
  );
}
