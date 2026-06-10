import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';
import { Button } from '@shared/components/Button';
import { colors, numeric } from '@constants/theme';

const PERMISSIONS = [
  {
    num: '01',
    icon: 'notifications-outline',
    title: 'Notificações',
    description:
      'Saber na hora quando seu pack sair pra correr — e quando você desbloquear uma conquista.',
  },
  {
    num: '02',
    icon: 'navigate-outline',
    title: 'Localização',
    description: 'Medir a distância que você percorre durante a corrida. Só isso.',
  },
] as const;

export default function PermissionsScreen() {
  const { requestPermissionsAndFinish, isLoading } = useOnboarding();

  return (
    <View className="flex-1 bg-surface-bg px-8 justify-between pt-24 pb-12">
      <View>
        <Text
          className="text-brand-primary text-[12px] font-bold uppercase"
          style={{ letterSpacing: 3 }}
        >
          Última etapa
        </Text>
        <Text className="text-text-primary text-[32px] font-extrabold tracking-tight leading-[38px] mt-3">
          Libere o essencial.
        </Text>
        <Text className="text-text-secondary text-[15px] leading-[22px] mt-3">
          Duas permissões, nada além delas. É o que faz a corrida ao vivo funcionar.
        </Text>
      </View>

      <View className="gap-4">
        {PERMISSIONS.map((permission) => (
          <View
            key={permission.num}
            className="flex-row gap-4 bg-surface-card rounded-[20px] p-5"
          >
            <View className="items-center gap-2">
              <View className="w-11 h-11 rounded-full bg-surface-elevated items-center justify-center">
                <Ionicons name={permission.icon} size={19} color={colors.brand.primary} />
              </View>
              <Text className="text-text-disabled" style={{ ...numeric, fontSize: 11 }}>
                {permission.num}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-[15px]">{permission.title}</Text>
              <Text className="text-text-secondary text-[13px] leading-5 mt-1">
                {permission.description}
              </Text>
            </View>
          </View>
        ))}

        <View className="flex-row items-center gap-3 px-1 mt-1">
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.status.success} />
          <Text className="text-text-disabled text-[12px] leading-[17px] flex-1">
            Sem mapa, sem rota publicada. O que aparece pro seu pack são números — distância,
            tempo e pace.
          </Text>
        </View>
      </View>

      <Button label="Liberar e começar" onPress={requestPermissionsAndFinish} loading={isLoading} />
    </View>
  );
}
