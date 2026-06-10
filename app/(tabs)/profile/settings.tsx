import { Alert, Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useDeleteAccount } from '@features/profile/hooks/useProfileActions';
import { useNotificationPreferences } from '@features/notifications/hooks/useNotificationPreferences';
import type { NotificationPreferences } from '@features/notifications/types';

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

function NotifToggleRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5 bg-surface-card">
      <Ionicons name={icon as any} size={20} color="#A1A1AA" style={{ marginRight: 14 }} />
      <Text className="flex-1 text-text-primary" style={{ fontSize: 15 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3F3F46', true: '#F97316' }}
        thumbColor="#FAFAFA"
      />
    </View>
  );
}

const NOTIF_ROWS: { key: keyof NotificationPreferences; icon: string; label: string }[] = [
  { key: 'friendRequest',       icon: 'person-add-outline',    label: 'Solicitação de amizade' },
  { key: 'friendAccepted',      icon: 'people-outline',        label: 'Amizade aceita' },
  { key: 'sessionStarted',      icon: 'fitness-outline',       label: 'Corrida de grupo iniciada' },
  { key: 'friendRunStarted',    icon: 'walk-outline',          label: 'Amigo iniciou corrida' },
  { key: 'friendJoinedRun',     icon: 'enter-outline',         label: 'Amigo entrou na corrida' },
  { key: 'achievementUnlocked', icon: 'trophy-outline',        label: 'Conquista desbloqueada' },
  { key: 'runResult',           icon: 'flag-outline',          label: 'Resultado de corrida' },
];

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#3F3F46' }} />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useLogout();
  const deleteAccount = useDeleteAccount();
  const { data: prefs, update } = useNotificationPreferences();

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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Notificações */}
        <SectionLabel label="Notificações" />
        <View className="rounded-2xl overflow-hidden border border-surface-border">
          {NOTIF_ROWS.map((row, idx) => (
            <View key={row.key}>
              {idx > 0 && <Divider />}
              <NotifToggleRow
                icon={row.icon}
                label={row.label}
                value={prefs?.[row.key] ?? true}
                onToggle={(v) => update.mutate({ key: row.key, value: v })}
              />
            </View>
          ))}
        </View>

        {/* Suporte */}
        <SectionLabel label="Suporte" />
        <View className="rounded-2xl overflow-hidden border border-surface-border">
          <SettingsRow
            icon="mail-outline"
            label="Contato com suporte"
            onPress={() => Linking.openURL('mailto:suporte@runpack.app?subject=Suporte RunPack')}
          />
          <Divider />
          <SettingsRow
            icon="document-text-outline"
            label="Termos de uso"
            onPress={() => Linking.openURL('https://runpack.app/termos')}
          />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Política de privacidade"
            onPress={() => Linking.openURL('https://runpack.app/privacidade')}
          />
        </View>

        {/* Conta */}
        <SectionLabel label="Conta" />
        <View className="rounded-2xl overflow-hidden border border-surface-border">
          <SettingsRow
            icon="log-out-outline"
            label="Sair da conta"
            onPress={handleLogout}
          />
          <Divider />
          <SettingsRow
            icon="trash-outline"
            label="Excluir conta"
            onPress={handleDeleteAccount}
            destructive
            hideChevron
          />
        </View>
      </ScrollView>
    </View>
  );
}
