import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useGroupsInfinite, useGroupMembers } from '@features/groups/hooks/useGroups';
import { MemberAvatarStack } from '@shared/components/MemberAvatarStack';
import { SearchBar } from '@shared/components/SearchBar';
import { EmptyState } from '@shared/components/EmptyState';
import { Fab } from '@shared/components/Fab';
import { useDebounce } from '@shared/hooks/useDebounce';
import { colors } from '@constants/theme';
import type { Group } from '@features/groups/types';
import { useCallback, useState } from 'react';

const MAX_VISIBLE_AVATARS = 6;

function GroupListCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const { data: allMembers } = useGroupMembers(group.id);
  const members = (allMembers ?? []).slice(0, MAX_VISIBLE_AVATARS);
  const adminMember = (allMembers ?? []).find((m) => m.role === 'admin');

  return (
    <TouchableOpacity
      className="bg-surface-card rounded-[20px] p-5 mb-2.5"
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Grupo ${group.name}, ${group.memberCount} membros`}
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-text-primary font-bold text-base flex-1" numberOfLines={1}>
          {group.name}
        </Text>
        {group.myRole === 'admin' && (
          <View className="px-2 py-0.5 rounded-full bg-surface-elevated">
            <Text
              className="text-brand-primary text-[10px] font-bold uppercase"
              style={{ letterSpacing: 0.5 }}
            >
              Admin
            </Text>
          </View>
        )}
      </View>

      {group.description ? (
        <Text className="text-text-secondary text-[13px] leading-5 mt-1" numberOfLines={2}>
          {group.description}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between mt-4">
        {members.length > 0 ? (
          <MemberAvatarStack
            members={members}
            totalCount={group.memberCount}
            borderColor={colors.surface.card}
            size={26}
          />
        ) : (
          <View style={{ height: 26 }} />
        )}

        {group.activeSessionId ? (
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <Text
              className="text-status-success text-[10px] font-bold uppercase"
              style={{ letterSpacing: 1 }}
            >
              Em corrida
            </Text>
          </View>
        ) : (
          <Text className="text-text-secondary text-xs">
            {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
            {adminMember ? ` · ${adminMember.name}` : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function GroupsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const {
    data, isLoading, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useGroupsInfinite(debouncedQuery.trim());

  const groups = data?.pages.flatMap((p) => p.content) ?? [];

  const renderGroup = useCallback(({ item }: { item: Group }) => (
    <GroupListCard group={item} onPress={() => router.push(`/(tabs)/groups/${item.id}`)} />
  ), [router]);

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-5 pt-14 pb-4">
        <Text className="text-text-primary text-[28px] font-extrabold tracking-tight mb-4">Grupos</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar grupo pelo nome..."
          autoCapitalize="sentences"
        />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.brand.primary} />
        }
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage
            ? <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
            : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 32 }} />
          ) : (
            <EmptyState
              icon="people-outline"
              title={debouncedQuery.trim() ? 'Nenhum grupo encontrado' : 'Nenhum grupo ainda'}
              subtitle={debouncedQuery.trim() ? undefined : 'Crie um ou aguarde um convite.'}
            />
          )
        }
      />

      <Fab icon="add" onPress={() => router.push('/(tabs)/groups/create')} accessibilityLabel="Criar grupo" />
    </View>
  );
}
