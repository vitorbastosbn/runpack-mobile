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
import { SectionLabel } from '@shared/components/SectionLabel';
import { Fab } from '@shared/components/Fab';
import { MoreMenu, type MoreMenuItem } from '@shared/components/MoreMenu';
import { GroupImage } from '@shared/components/GroupImage';
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

  const handleStartSession = () => setGoalModalVisible(true);

  const handleConfirmStart = (distanceGoalM: number | null) => {
    createSession({ groupId: id, distanceGoalM });
  };
  const { joinSession, isLoading: joiningSession } = useJoinSession();

  const isAdmin = group?.myRole === 'admin';
  const live = !!group?.activeSessionId;

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

  const renderMember = useCallback(({ item }: { item: GroupMember }) => {
    const tappable = isAdmin || item.userId === currentUserId;
    return (
      <TouchableOpacity
        className="flex-row items-center px-5 py-3"
        onPress={() => handleMemberAction(item)}
        activeOpacity={tappable ? 0.7 : 1}
      >
        <Avatar name={item.name} avatarUrl={item.avatarUrl} />
        <View className="flex-1 ml-3 mr-2">
          <Text className="text-text-primary font-semibold text-[15px]" numberOfLines={1}>
            {item.name}{item.userId === currentUserId ? ' (você)' : ''}
          </Text>
          <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
            {item.username}
          </Text>
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
        {tappable && (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.text.disabled}
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    );
  }, [isAdmin, currentUserId, removeMember, updateRole]);

  const memberSeparator = useCallback(
    () => <View style={{ height: 0.5, backgroundColor: colors.surface.border, marginLeft: 72 }} />,
    [],
  );

  const listHeader = group ? (
    <>
      {/* Hero — monogram identity */}
      <View className="items-center px-6 pt-2 pb-6">
        <GroupImage groupId={group.id} imageUrl={group.imageUrl} size={76} radius={24} />

        <Text
          className="text-text-primary text-[24px] font-extrabold tracking-tight mt-4 text-center"
          numberOfLines={2}
        >
          {group.name}
        </Text>

        {live ? (
          <View className="flex-row items-center gap-1.5 mt-2">
            <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <Text
              className="text-status-success text-[11px] font-bold uppercase"
              style={{ letterSpacing: 1.2 }}
            >
              Corrida em andamento
            </Text>
          </View>
        ) : (
          <Text className="text-text-secondary text-[13px] mt-1.5">
            {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
            {isAdmin ? ' · você é admin' : ''}
          </Text>
        )}

        {group.description ? (
          <Text className="text-text-secondary text-[14px] leading-[21px] text-center mt-4">
            {group.description}
          </Text>
        ) : null}
      </View>

      {/* Last-run podium + history access */}
      {lastRun && lastRun.podium.length > 0 && (
        <View className="px-5 mb-7">
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

      <View className="px-5 mb-1">
        <SectionLabel label={`Membros · ${group.memberCount}`} />
      </View>
    </>
  ) : null;

  if (loadingGroup) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Slim nav — title lives in the hero */}
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/groups')}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-surface-card items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <MoreMenu
          shape="full"
          accessibilityLabel="Opções do grupo"
          items={[
            { label: 'Convidar para o grupo', icon: 'person-add-outline', onPress: handleShareInvite },
            { label: 'Sair do grupo', icon: 'exit-outline', destructive: true, onPress: handleLeaveGroup },
            ...(isAdmin
              ? [{ label: 'Deletar grupo', icon: 'trash-outline', destructive: true, onPress: handleDelete } as MoreMenuItem]
              : []),
          ]}
        />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.memberId}
        renderItem={renderMember}
        ItemSeparatorComponent={memberSeparator}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingBottom: 110 }}
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
    </View>
  );
}
