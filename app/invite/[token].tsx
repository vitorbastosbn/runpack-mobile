import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useInviteInfo, useAcceptInvite } from '@features/invites/hooks/useInvite';
import { useAuthStore } from '@store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { GROUPS_KEY } from '@features/groups/hooks/useGroups';

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
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  if (error || !invite) {
    const { title, subtitle } = getErrorMessage();
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Ionicons name="link-outline" size={56} color="#3F3F46" />
        <Text className="text-text-primary text-xl font-bold mt-6">{title}</Text>
        <Text className="text-text-secondary text-center mt-2">{subtitle}</Text>
        <TouchableOpacity
          className="mt-8 bg-surface-card border border-surface-border rounded-xl px-6 py-3"
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
      <View className="w-20 h-20 rounded-2xl bg-surface-card border border-surface-border items-center justify-center mb-6">
        <Ionicons name={icon} size={36} color="#F97316" />
      </View>

      <Text className="text-text-secondary text-sm">Você foi convidado para o {typeLabel}</Text>
      <Text className="text-text-primary text-2xl font-bold mt-1 text-center">{invite.targetName}</Text>
      <Text className="text-text-secondary text-sm mt-3">
        Convite de <Text className="text-text-primary font-semibold">{invite.invitedBy.name}</Text>
      </Text>

      <TouchableOpacity
        className="w-full bg-brand-primary rounded-xl py-4 items-center mt-10"
        onPress={handleAccept}
        disabled={acceptInvite.isPending}
        activeOpacity={0.85}
      >
        {acceptInvite.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">Entrar no {typeLabel}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 py-3" onPress={() => router.replace('/(tabs)/home')}>
        <Text className="text-text-secondary">Recusar</Text>
      </TouchableOpacity>
    </View>
  );
}
