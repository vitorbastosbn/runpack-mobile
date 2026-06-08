import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroup, useGroupMembers, useDeleteGroup, useRemoveMember, useUpdateMemberRole } from '@features/groups/hooks/useGroups';
import { useAuthStore } from '@store/auth.store';
import { Avatar } from '@shared/components/Avatar';
import { invitesService } from '@features/invites/services/invites.service';
import type { GroupMember } from '@features/groups/types';
import { Share } from 'react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data: group, isLoading: loadingGroup } = useGroup(id);
  const { data: members = [], isLoading: loadingMembers } = useGroupMembers(id);
  const deleteGroup = useDeleteGroup();
  const removeMember = useRemoveMember(id);
  const updateRole = useUpdateMemberRole(id);

  const isAdmin = group?.myRole === 'admin';

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

  const handleMemberAction = (member: GroupMember) => {
    if (member.userId === currentUserId) {
      Alert.alert('Sair do grupo', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => removeMember.mutate(member.userId) },
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
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
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
        {isAdmin && (
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {group?.description ? (
        <Text className="text-text-secondary text-sm px-4 mb-4">{group.description}</Text>
      ) : null}

      <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider px-4 mb-2">
        Membros
      </Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.memberId}
        renderItem={renderMember}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          loadingMembers ? <ActivityIndicator color="#F97316" style={{ marginTop: 16 }} /> : null
        }
      />
    </View>
  );
}
