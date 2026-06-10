import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@shared/components/Button';
import { colors } from '@constants/theme';

const FEATURES = [
  { icon: 'flash', label: 'Inicie uma corrida em segundos e chame seus amigos' },
  { icon: 'trophy', label: 'Dispute quem corre mais longe em ranking ao vivo' },
  { icon: 'stats-chart', label: 'Desbloqueie conquistas e acompanhe sua evolução' },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface-bg px-8 justify-between pt-24 pb-12">
      <View>
        <Text
          className="text-text-secondary text-[12px] font-semibold uppercase"
          style={{ letterSpacing: 3 }}
        >
          RunPack
        </Text>
        <Text className="text-text-primary text-[40px] font-extrabold tracking-tight leading-[46px] mt-3">
          Corra junto.{'\n'}Mesmo <Text className="text-brand-primary">longe</Text>.
        </Text>
      </View>

      <View className="gap-7">
        {FEATURES.map((f) => (
          <View key={f.icon} className="flex-row items-center gap-4">
            <View className="w-11 h-11 rounded-full bg-surface-card items-center justify-center">
              <Ionicons name={f.icon} size={19} color={colors.brand.primary} />
            </View>
            <Text className="text-text-primary text-[15px] leading-[22px] flex-1">{f.label}</Text>
          </View>
        ))}
      </View>

      <Button label="Continuar" onPress={() => router.push('/(onboarding)/permissions')} />
    </View>
  );
}
