import { Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useDeleteAccount } from '@features/profile/hooks/useProfileActions';
import { useNotificationPreferences } from '@features/notifications/hooks/useNotificationPreferences';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { confirmAction } from '@shared/components/AppDialogs';
import { colors } from '@constants/theme';
import type { NotificationPreferences } from '@features/notifications/types';

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-text-secondary text-[11px] font-semibold uppercase mb-3 mt-8 mx-1"
      style={{ letterSpacing: 1.4 }}
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
  const color = destructive ? colors.status.error : colors.text.primary;
  const iconColor = destructive ? colors.status.error : colors.text.secondary;

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 bg-surface-card"
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon as any} size={19} color={iconColor} style={{ marginRight: 14 }} />
      <View className="flex-1">
        <Text style={{ color, fontSize: 15 }}>{label}</Text>
        {sublabel ? <Text className="text-text-disabled text-xs mt-0.5">{sublabel}</Text> : null}
      </View>
      {!hideChevron && <Ionicons name="chevron-forward" size={15} color={colors.text.disabled} />}
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
      <Ionicons name={icon as any} size={19} color={colors.text.secondary} style={{ marginRight: 14 }} />
      <Text className="flex-1 text-text-primary" style={{ fontSize: 15 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surface.elevated, true: colors.brand.primary }}
        thumbColor="#F7F7F8"
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
  return <View style={{ height: 0.5, backgroundColor: colors.surface.border }} />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useLogout();
  const deleteAccount = useDeleteAccount();
  const { data: prefs, update } = useNotificationPreferences();

  const handleLogout = async () => {
    const ok = await confirmAction({
      title: 'Sair da conta',
      message: 'Você precisará entrar novamente com o Google.',
      confirmLabel: 'Sair',
      destructive: true,
    });
    if (ok) logout();
  };

  const handleDeleteAccount = async () => {
    const ok = await confirmAction({
      title: 'Excluir conta',
      message:
        'Todos os seus dados serão excluídos permanentemente — corridas, grupos, conquistas e histórico. Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir permanentemente',
      destructive: true,
    });
    if (ok) deleteAccount.mutate();
  };

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader title="Configurações" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Notificações */}
        <SectionLabel label="Notificações" />
        <View className="rounded-[20px] overflow-hidden">
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
        <View className="rounded-[20px] overflow-hidden">
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
        <View className="rounded-[20px] overflow-hidden">
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
