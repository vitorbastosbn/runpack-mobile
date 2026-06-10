import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';
import { Button } from '@shared/components/Button';
import { colors } from '@constants/theme';

const PERMISSIONS = [
  {
    icon: 'notifications',
    title: 'Notificações',
    description: 'Para avisar quando seus amigos iniciarem uma corrida ou aceitarem seu convite.',
  },
  {
    icon: 'location',
    title: 'Localização',
    description: 'Para medir sua distância percorrida durante a corrida.',
  },
] as const;

export default function PermissionsScreen() {
  const { requestPermissionsAndFinish, isLoading } = useOnboarding();

  return (
    <View className="flex-1 bg-surface-bg px-8 justify-between pt-24 pb-12">
      <View>
        <Text
          className="text-text-secondary text-[12px] font-semibold uppercase"
          style={{ letterSpacing: 3 }}
        >
          Antes de começar
        </Text>
        <Text className="text-text-primary text-[32px] font-extrabold tracking-tight mt-3">
          Permissões
        </Text>
        <Text className="text-text-secondary text-[15px] leading-[22px] mt-2">
          O RunPack precisa das suas permissões para funcionar corretamente.
        </Text>
      </View>

      <View className="gap-4">
        {PERMISSIONS.map((p) => (
          <View key={p.icon} className="flex-row gap-4 bg-surface-card rounded-[20px] p-5">
            <View className="w-11 h-11 rounded-full bg-surface-elevated items-center justify-center">
              <Ionicons name={p.icon} size={19} color={colors.brand.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-[15px]">{p.title}</Text>
              <Text className="text-text-secondary text-[13px] leading-5 mt-1">{p.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button label="Começar" onPress={requestPermissionsAndFinish} loading={isLoading} />
    </View>
  );
}
