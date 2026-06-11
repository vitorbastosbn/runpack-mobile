import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useInviteInfo, useAcceptInvite } from '@features/invites/hooks/useInvite';
import { useAuthStore } from '@store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { GROUPS_KEY } from '@features/groups/hooks/useGroups';
import { Button } from '@shared/components/Button';
import { colors } from '@constants/theme';

const PENDING_INVITE_KEY = 'pending_invite_token';

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const { data: invite, isLoading, error } = useInviteInfo(token);
  const acceptInvite = useAcceptInvite();

  useEffect(() => {
    if (!isAuthenticated) {
      SecureStore.setItemAsync(PENDING_INVITE_KEY, token).then(() => {
        router.replace('/(auth)/login');
      });
    }
  }, [isAuthenticated, token]);

  const handleAccept = async () => {
    try {
      const result = await acceptInvite.mutateAsync(token);
      await SecureStore.deleteItemAsync(PENDING_INVITE_KEY);
      queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
      if (result.type === 'group') {
        router.replace(`/(tabs)/groups/${result.targetId}`);
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409 || status === 410 || status === 404) {
        router.replace('/invite/invalid');
      }
    }
  };

  const getErrorMessage = () => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 410) return { title: 'Link expirado', subtitle: 'Este convite já não está mais válido.' };
    if (status === 409) return { title: 'Link já utilizado', subtitle: 'Este convite já foi aceito anteriormente.' };
    return { title: 'Link inválido', subtitle: 'Este convite não existe ou foi removido.' };
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color={colors.brand.primary} size="large" />
      </View>
    );
  }

  if (error || !invite) {
    const { title, subtitle } = getErrorMessage();
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-surface-card items-center justify-center">
          <Ionicons name="link-outline" size={28} color={colors.text.disabled} />
        </View>
        <Text className="text-text-primary text-xl font-extrabold tracking-tight mt-6">{title}</Text>
        <Text className="text-text-secondary text-center mt-2">{subtitle}</Text>
        <TouchableOpacity
          className="mt-8 bg-surface-card rounded-full px-6 py-3"
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text className="text-text-primary font-semibold">Ir para o início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeLabel = invite.type === 'group' ? 'grupo' : 'corrida';
  const icon = invite.type === 'group' ? 'people' : 'flash';

  return (
    <View className="flex-1 bg-surface-bg items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-surface-card items-center justify-center mb-7">
        <Ionicons name={icon} size={32} color={colors.brand.primary} />
      </View>

      <Text className="text-text-secondary text-sm">Você foi convidado para o {typeLabel}</Text>
      <Text className="text-text-primary text-[26px] font-extrabold tracking-tight mt-1 text-center">
        {invite.targetName}
      </Text>
      <Text className="text-text-secondary text-sm mt-3">
        Convite de <Text className="text-text-primary font-semibold">{invite.invitedBy.name}</Text>
      </Text>

      <View className="w-full mt-10">
        <Button
          label={`Entrar no ${typeLabel}`}
          onPress={handleAccept}
          loading={acceptInvite.isPending}
        />
      </View>

      <TouchableOpacity className="mt-4 py-3" onPress={() => router.replace('/(tabs)/home')}>
        <Text className="text-text-secondary">Recusar</Text>
      </TouchableOpacity>
      <AdBanner />
    </View>
  );
}
