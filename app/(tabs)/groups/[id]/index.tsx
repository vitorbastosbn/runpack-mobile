import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useGroup,
  useGroupMembers,
  useGroupLastRun,
  useDeleteGroup,
  useRemoveMember,
  useUpdateMemberRole,
} from '@features/groups/hooks/useGroups';
import { useAuthStore } from '@store/auth.store';
import { Avatar } from '@shared/components/Avatar';
import { RunPodium } from '@features/groups/components/RunPodium';
import { invitesService } from '@features/invites/services/invites.service';
import { useCreateSession, useJoinSession } from '@features/sessions/hooks/useCreateSession';
import { StartRaceModal } from '@features/sessions/components/StartRaceModal';
import type { GroupMember } from '@features/groups/types';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data: group, isLoading: loadingGroup } = useGroup(id);
  const { data: members = [], isLoading: loadingMembers } = useGroupMembers(id);
  const { data: lastRun } = useGroupLastRun(id);
  const deleteGroup = useDeleteGroup();
  const removeMember = useRemoveMember(id);
  const updateRole = useUpdateMemberRole(id);
  const { createSession, isLoading: startingSession } = useCreateSession();
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  const handleStartSession = () => setGoalModalVisible(true);

  const handleConfirmStart = (distanceGoalM: number | null) => {
    createSession({ groupId: id, distanceGoalM });
  };
  const { joinSession, isLoading: joiningSession } = useJoinSession();

  const isAdmin = group?.myRole === 'admin';
  const admins = members.filter((m) => m.role === 'admin');

  const handleShareInvite = async () => {
    try {
      const invite = await invitesService.createInvite('group', id);
      await Share.share({ message: `Entra no meu grupo no RunPack! ${invite.url}` });
    } catch {}
  };

  const handleDelete = () => {
    Alert.alert('Deletar grupo', `Tem certeza que deseja deletar "${group?.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar', style: 'destructive',
        onPress: async () => {
          await deleteGroup.mutateAsync(id);
          router.replace('/(tabs)/groups');
        },
      },
    ]);
  };

  const handleLeaveGroup = () => {
    Alert.alert('Sair do grupo', `Tem certeza que deseja sair de "${group?.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          if (!currentUserId) return;
          try {
            await removeMember.mutateAsync(currentUserId);
            router.replace('/(tabs)/groups');
          } catch {
            Alert.alert('Não foi possível sair', 'Transfira o papel de admin antes de sair do grupo.');
          }
        },
      },
    ]);
  };

  const handleMemberAction = (member: GroupMember) => {
    if (member.userId === currentUserId) {
      Alert.alert('Sair do grupo', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember.mutateAsync(member.userId);
              router.replace('/(tabs)/groups');
            } catch {
              Alert.alert('Não foi possível sair', 'Transfira o papel de admin antes de sair do grupo.');
            }
          },
        },
      ]);
      return;
    }
    if (!isAdmin) return;
    const options = [
      { text: 'Cancelar', style: 'cancel' as const },
      {
        text: 'Remover do grupo', style: 'destructive' as const,
        onPress: () => removeMember.mutate(member.userId),
      },
      member.role === 'member'
        ? { text: 'Tornar admin', onPress: () => updateRole.mutate({ userId: member.userId, role: 'admin' }) }
        : { text: 'Remover admin', onPress: () => updateRole.mutate({ userId: member.userId, role: 'member' }) },
    ];
    Alert.alert(member.name, undefined, options);
  };

  const renderMember = useCallback(({ item }: { item: GroupMember }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 mb-2 bg-surface-card border border-surface-border rounded-xl"
      onPress={() => handleMemberAction(item)}
      activeOpacity={isAdmin || item.userId === currentUserId ? 0.7 : 1}
    >
      <View className="mr-3">
        <Avatar name={item.name} avatarUrl={item.avatarUrl} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold">
          {item.name}{item.userId === currentUserId ? ' (você)' : ''}
        </Text>
        <Text className="text-text-secondary text-xs">{item.username}</Text>
      </View>
      {item.role === 'admin' && (
        <View className="px-2 py-0.5 rounded bg-brand-primary/20 border border-brand-primary/40">
          <Text className="text-brand-primary text-xs font-semibold">Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  ), [isAdmin, currentUserId, removeMember, updateRole]);

  const listHeader = (
    <>
      {/* Group info card: optional description + admin */}
      {(group?.description || admins.length > 0) && (
        <View className="bg-surface-card border border-surface-border rounded-2xl p-4 mb-6">
          {group?.description ? (
            <Text className="text-text-primary text-sm leading-5">{group.description}</Text>
          ) : null}

          {admins.length > 0 && (
            <View
              className={`flex-row items-center ${
                group?.description ? 'mt-4 pt-4 border-t border-surface-border' : ''
              }`}
            >
              <Avatar name={admins[0].name} avatarUrl={admins[0].avatarUrl} size={28} />
              <View className="flex-1 ml-3">
                <Text className="text-text-secondary text-[11px] uppercase tracking-wider">
                  {admins.length > 1 ? 'Administradores' : 'Administrador'}
                </Text>
                <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
                  {admins[0].name}
                  {admins.length > 1 ? ` +${admins.length - 1}` : ''}
                </Text>
              </View>
              <Ionicons name="shield-checkmark" size={16} color="#F97316" />
            </View>
          )}
        </View>
      )}

      {/* Last-run podium + history access */}
      {lastRun && lastRun.podium.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
              Último resultado
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/groups/${id}/runs`)}
              hitSlop={8}
              className="flex-row items-center gap-1"
            >
              <Text className="text-brand-primary text-sm">Histórico</Text>
              <Ionicons name="chevron-forward" size={14} color="#F97316" />
            </TouchableOpacity>
          </View>
          <View className="bg-surface-card border border-surface-border rounded-2xl p-4">
            <RunPodium podium={lastRun.podium} />
          </View>
        </View>
      )}

      <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
        Membros
      </Text>
    </>
  );

  if (loadingGroup) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.replace('/(tabs)/groups')} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-text-primary text-xl font-bold" numberOfLines={1}>{group?.name}</Text>
          <Text className="text-text-secondary text-xs">
            {group?.memberCount} {group?.memberCount === 1 ? 'membro' : 'membros'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleShareInvite} hitSlop={8} className="mr-3">
          <Ionicons name="person-add-outline" size={20} color="#F97316" />
        </TouchableOpacity>
        {isAdmin ? (
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLeaveGroup} hitSlop={8}>
            <Ionicons name="exit-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.memberId}
        renderItem={renderMember}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          loadingMembers ? <ActivityIndicator color="#F97316" style={{ marginTop: 16 }} /> : null
        }
      />

      {/* FAB — enter active run, or start a new one (admin) */}
      {group?.activeSessionId ? (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 28, right: 20 }}
          className="w-16 h-16 bg-brand-primary rounded-full items-center justify-center"
          onPress={() => joinSession(group.activeSessionId!)}
          disabled={joiningSession}
          activeOpacity={0.85}
        >
          {joiningSession ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="enter-outline" size={28} color="#fff" />
          )}
        </TouchableOpacity>
      ) : isAdmin ? (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 28, right: 20 }}
          className="w-16 h-16 bg-brand-primary rounded-full items-center justify-center"
          onPress={handleStartSession}
          disabled={startingSession}
          activeOpacity={0.85}
        >
          {startingSession ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="flash" size={28} color="#fff" />
          )}
        </TouchableOpacity>
      ) : null}

      <StartRaceModal
        visible={goalModalVisible}
        loading={startingSession}
        onClose={() => setGoalModalVisible(false)}
        onStart={handleConfirmStart}
      />
    </View>
  );
}
