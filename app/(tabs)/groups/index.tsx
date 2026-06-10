import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroupsInfinite, useGroupMembers } from '@features/groups/hooks/useGroups';
import { MemberAvatarStack } from '@shared/components/MemberAvatarStack';
import { useDebounce } from '@shared/hooks/useDebounce';
import type { Group } from '@features/groups/types';
import { useCallback, useState } from 'react';

const SURFACE_CARD = '#18181B';
const MAX_VISIBLE_AVATARS = 6;

function GroupListCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const { data: allMembers } = useGroupMembers(group.id);
  const members = (allMembers ?? []).slice(0, MAX_VISIBLE_AVATARS);
  const adminMember = (allMembers ?? []).find((m) => m.role === 'admin');

  return (
    <TouchableOpacity
      className="bg-surface-card border border-surface-border rounded-2xl p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Grupo ${group.name}, ${group.memberCount} membros`}
    >
      {/* Title + admin star */}
      <View className="flex-row items-center gap-2">
        <Text className="text-text-primary font-bold text-base flex-1" numberOfLines={1}>
          {group.name}
        </Text>
        {group.myRole === 'admin' && (
          <Ionicons name="star" size={16} color="#F97316" />
        )}
      </View>

      {group.description ? (
        <Text className="text-text-secondary text-sm mt-1">
          {group.description}
        </Text>
      ) : null}

      {/* Admin info */}
      {adminMember && (
        <View className="flex-row items-center gap-1.5 mt-2 bg-surface-elevated rounded-full px-2.5 py-1" style={{ alignSelf: 'flex-start' }}>
          <Ionicons name="shield-checkmark" size={11} color="#F97316" />
          <Text className="text-text-secondary text-xs font-medium">{adminMember.name}</Text>
        </View>
      )}

      {/* Footer: avatars + status */}
      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-surface-border">
        {members.length > 0 ? (
          <MemberAvatarStack
            members={members}
            totalCount={group.memberCount}
            borderColor={SURFACE_CARD}
            size={26}
          />
        ) : (
          <View style={{ height: 26 }} />
        )}

        {group.activeSessionId ? (
          <View className="flex-row items-center gap-1.5 bg-brand-green/15 border border-brand-green/40 rounded-full px-2.5 py-1">
            <View className="w-1.5 h-1.5 rounded-full bg-brand-green" />
            <Text className="text-brand-green text-xs font-semibold">Em corrida</Text>
          </View>
        ) : (
          <Text className="text-text-secondary text-xs">
            {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
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
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold mb-4">Grupos</Text>

        <View className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-3 py-2">
          <Ionicons name="search" size={18} color="#A1A1AA" />
          <TextInput
            className="flex-1 text-text-primary ml-2 text-sm"
            placeholder="Buscar grupo pelo nome..."
            placeholderTextColor="#A1A1AA"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#F97316" />}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color="#F97316" style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#F97316" style={{ marginTop: 32 }} />
          ) : (
            <View className="items-center mt-16">
              <Ionicons name="people-circle-outline" size={48} color="#3F3F46" />
              <Text className="text-text-secondary mt-4 text-center">
                {debouncedQuery.trim()
                  ? 'Nenhum grupo encontrado.'
                  : 'Nenhum grupo ainda.\nCrie um ou aguarde um convite.'}
              </Text>
            </View>
          )
        }
      />

      {/* FAB — create group */}
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 28, right: 20 }}
        className="w-16 h-16 bg-brand-primary rounded-full items-center justify-center"
        onPress={() => router.push('/(tabs)/groups/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
