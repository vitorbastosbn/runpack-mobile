import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';

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
    <View className="flex-1 bg-surface-bg px-8 justify-between py-16">
      <View className="mt-8">
        <Text className="text-text-primary text-3xl font-bold">Permissões necessárias</Text>
        <Text className="text-text-secondary text-base mt-2">
          O RunPack precisa das suas permissões para funcionar corretamente.
        </Text>
      </View>

      <View className="gap-5">
        {PERMISSIONS.map((p) => (
          <View key={p.icon} className="flex-row gap-4 bg-surface-card border border-surface-border rounded-xl p-4">
            <View className="w-11 h-11 rounded-lg bg-surface-elevated items-center justify-center">
              <Ionicons name={p.icon} size={22} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-base">{p.title}</Text>
              <Text className="text-text-secondary text-sm mt-1">{p.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="w-full bg-brand-primary rounded-xl py-4 items-center"
        onPress={requestPermissionsAndFinish}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">Começar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
