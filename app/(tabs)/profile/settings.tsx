import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useDeleteAccount } from '@features/profile/hooks/useProfileActions';

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-text-disabled text-xs font-semibold uppercase mb-2 mt-8 mx-1"
      style={{ letterSpacing: 1.2 }}
    >
      {label}
    </Text>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  destructive = false,
  hideChevron = false,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  hideChevron?: boolean;
}) {
  const color = destructive ? '#EF4444' : '#FAFAFA';
  const iconColor = destructive ? '#EF4444' : '#A1A1AA';

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 bg-surface-card"
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon as any} size={20} color={iconColor} style={{ marginRight: 14 }} />
      <View className="flex-1">
        <Text style={{ color, fontSize: 15 }}>{label}</Text>
        {sublabel ? <Text className="text-text-disabled text-xs mt-0.5">{sublabel}</Text> : null}
      </View>
      {!hideChevron && <Ionicons name="chevron-forward" size={16} color="#52525B" />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useLogout();
  const deleteAccount = useDeleteAccount();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Todos os seus dados serão excluídos permanentemente — corridas, grupos, conquistas e histórico. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir permanentemente',
          style: 'destructive',
          onPress: () => deleteAccount.mutate(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="flex-row items-center px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3" hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold flex-1">Configurações</Text>
      </View>

      <View className="px-5">
        <SectionLabel label="Suporte" />
        <View className="rounded-2xl overflow-hidden border border-surface-border">
          <SettingsRow
            icon="mail-outline"
            label="Contato com suporte"
            onPress={() => Linking.openURL('mailto:suporte@runpack.app?subject=Suporte RunPack')}
          />
          <View style={{ height: 1, backgroundColor: '#3F3F46' }} />
          <SettingsRow
            icon="document-text-outline"
            label="Termos de uso"
            onPress={() => Linking.openURL('https://runpack.app/termos')}
          />
          <View style={{ height: 1, backgroundColor: '#3F3F46' }} />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Política de privacidade"
            onPress={() => Linking.openURL('https://runpack.app/privacidade')}
          />
        </View>

        <SectionLabel label="Conta" />
        <View className="rounded-2xl overflow-hidden border border-surface-border">
          <SettingsRow
            icon="log-out-outline"
            label="Sair da conta"
            onPress={handleLogout}
          />
          <View style={{ height: 1, backgroundColor: '#3F3F46' }} />
          <SettingsRow
            icon="trash-outline"
            label="Excluir conta"
            onPress={handleDeleteAccount}
            destructive
            hideChevron
          />
        </View>
      </View>
    </View>
  );
}
