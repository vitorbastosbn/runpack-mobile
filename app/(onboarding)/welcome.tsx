import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
  { icon: 'flash', label: 'Inicie uma corrida em segundos e chame seus amigos' },
  { icon: 'trophy', label: 'Dispute quem corre mais longe em ranking ao vivo' },
  { icon: 'stats-chart', label: 'Desbloqueie conquistas e acompanhe sua evolução' },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface-bg px-8 justify-between py-16">
      <View className="items-center mt-8">
        <Text className="text-brand-primary text-6xl font-bold tracking-tighter">RunPack</Text>
        <Text className="text-text-secondary text-base mt-2">Corre Pace</Text>
      </View>

      <View className="gap-6">
        {FEATURES.map((f) => (
          <View key={f.icon} className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-xl bg-surface-card border border-surface-border items-center justify-center">
              <Ionicons name={f.icon} size={22} color="#F97316" />
            </View>
            <Text className="text-text-primary text-base flex-1">{f.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="w-full bg-brand-primary rounded-xl py-4 items-center"
        onPress={() => router.push('/(onboarding)/permissions')}
        activeOpacity={0.85}
      >
        <Text className="text-white font-bold text-base">Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}
