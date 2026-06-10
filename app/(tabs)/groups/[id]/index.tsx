import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Share, Modal } from 'react-native';
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
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { SectionLabel } from '@shared/components/SectionLabel';
import { Fab } from '@shared/components/Fab';
import { colors } from '@constants/theme';
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
  const [menuVisible, setMenuVisible] = useState(false);

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
      className="flex-row items-center px-4 py-3 mb-2 bg-surface-card rounded-[20px]"
      onPress={() => handleMemberAction(item)}
      activeOpacity={isAdmin || item.userId === currentUserId ? 0.7 : 1}
    >
      <View className="mr-3">
        <Avatar name={item.name} avatarUrl={item.avatarUrl} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-[15px]">
          {item.name}{item.userId === currentUserId ? ' (você)' : ''}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">{item.username}</Text>
      </View>
      {item.role === 'admin' && (
        <View className="px-2 py-0.5 rounded-full bg-surface-elevated">
          <Text
            className="text-brand-primary text-[10px] font-bold uppercase"
            style={{ letterSpacing: 0.5 }}
          >
            Admin
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [isAdmin, currentUserId, removeMember, updateRole]);

  const listHeader = (
    <>
      {/* Group info card: optional description + admin */}
      {(group?.description || admins.length > 0) && (
        <View className="bg-surface-card rounded-[20px] p-5 mb-7">
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
                <Text
                  className="text-text-secondary text-[10px] font-semibold uppercase"
                  style={{ letterSpacing: 1 }}
                >
                  {admins.length > 1 ? 'Administradores' : 'Administrador'}
                </Text>
                <Text className="text-text-primary text-sm font-semibold mt-0.5" numberOfLines={1}>
                  {admins[0].name}
                  {admins.length > 1 ? ` +${admins.length - 1}` : ''}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Last-run podium + history access */}
      {lastRun && lastRun.podium.length > 0 && (
        <View className="mb-7">
          <SectionLabel
            label="Último resultado"
            action="Histórico"
            onAction={() => router.push(`/(tabs)/groups/${id}/runs`)}
          />
          <View className="bg-surface-card rounded-[20px] p-5">
            <RunPodium podium={lastRun.podium} />
          </View>
        </View>
      )}

      <SectionLabel label="Membros" />
    </>
  );

  if (loadingGroup) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader
        title={group?.name ?? ''}
        subtitle={`${group?.memberCount} ${group?.memberCount === 1 ? 'membro' : 'membros'}`}
        onBack={() => router.replace('/(tabs)/groups')}
        right={
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            hitSlop={8}
            className="w-9 h-9 rounded-full bg-surface-card items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Opções do grupo"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.text.primary} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={members}
        keyExtractor={(item) => item.memberId}
        renderItem={renderMember}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        ListEmptyComponent={
          loadingMembers ? <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 16 }} /> : null
        }
      />

      {/* FAB — enter active run, or start a new one (admin) */}
      {group?.activeSessionId ? (
        <Fab
          icon="enter-outline"
          onPress={() => joinSession(group.activeSessionId!)}
          loading={joiningSession}
          accessibilityLabel="Entrar na corrida"
        />
      ) : isAdmin ? (
        <Fab
          icon="flash"
          onPress={handleStartSession}
          loading={startingSession}
          accessibilityLabel="Iniciar corrida"
        />
      ) : null}

      <StartRaceModal
        visible={goalModalVisible}
        loading={startingSession}
        onClose={() => setGoalModalVisible(false)}
        onStart={handleConfirmStart}
      />

      {/* Dropdown menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={{
              position: 'absolute',
              top: 100,
              right: 20,
              backgroundColor: colors.surface.elevated,
              borderRadius: 18,
              overflow: 'hidden',
              minWidth: 220,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              onPress={() => { setMenuVisible(false); handleShareInvite(); }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, fontSize: 15 }}>Convidar para o grupo</Text>
            </TouchableOpacity>

            <View style={{ height: 0.5, backgroundColor: colors.surface.border }} />

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              onPress={() => { setMenuVisible(false); handleLeaveGroup(); }}
              activeOpacity={0.7}
            >
              <Ionicons name="exit-outline" size={18} color={colors.status.error} />
              <Text style={{ color: colors.status.error, fontSize: 15 }}>Sair do grupo</Text>
            </TouchableOpacity>

            {isAdmin && (
              <>
                <View style={{ height: 0.5, backgroundColor: colors.surface.border }} />
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
                  onPress={() => { setMenuVisible(false); handleDelete(); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                  <Text style={{ color: colors.status.error, fontSize: 15 }}>Deletar grupo</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
