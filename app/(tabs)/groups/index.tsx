import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroupsInfinite } from '@features/groups/hooks/useGroups';
import { SearchBar } from '@shared/components/SearchBar';
import { EmptyState } from '@shared/components/EmptyState';
import { Fab } from '@shared/components/Fab';
import { GroupImage } from '@shared/components/GroupImage';
import { useDebounce } from '@shared/hooks/useDebounce';
import { colors } from '@constants/theme';
import type { Group } from '@features/groups/types';
import { useCallback, useMemo, useState } from 'react';

function GroupRow({ group, onPress }: { group: Group; onPress: () => void }) {
  const live = !!group.activeSessionId;
  const meta = [
    `${group.memberCount} ${group.memberCount === 1 ? 'membro' : 'membros'}`,
    ...(group.myRole === 'admin' ? ['você é admin'] : []),
  ].join(' · ');

  return (
    <TouchableOpacity
      className="flex-row items-center px-5 py-4"
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Grupo ${group.name}, ${group.memberCount} membros${live ? ', em corrida' : ''}`}
    >
      <GroupImage groupId={group.id} imageUrl={group.imageUrl} size={48} radius={16} />

      {/* Name + meta */}
      <View className="flex-1 ml-4 mr-3">
        <Text className="text-text-primary text-[16px] font-bold" numberOfLines={1}>
          {group.name}
        </Text>
        <Text className="text-text-secondary text-[13px] mt-0.5" numberOfLines={1}>
          {live ? 'Corrida em andamento' : meta}
        </Text>
      </View>

      {/* Status */}
      {live ? (
        <View className="flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
          <Text
            className="text-status-success text-[10px] font-bold uppercase"
            style={{ letterSpacing: 1 }}
          >
            Ao vivo
          </Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={15} color={colors.text.disabled} />
      )}
    </TouchableOpacity>
  );
}

function Separator() {
  // Hairline alinhada com o texto — começa após o monograma.
  return <View style={{ height: 0.5, backgroundColor: colors.surface.border, marginLeft: 88 }} />;
}

export default function GroupsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const {
    data, isLoading, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useGroupsInfinite(debouncedQuery.trim());

  // Grupos ao vivo sobem para o topo — o que está acontecendo agora vem primeiro.
  const groups = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.content) ?? [];
    return [...all].sort((a, b) => Number(!!b.activeSessionId) - Number(!!a.activeSessionId));
  }, [data]);

  const totalCount = data?.pages[0]?.totalElements ?? groups.length;

  const renderGroup = useCallback(({ item }: { item: Group }) => (
    <GroupRow group={item} onPress={() => router.push(`/(tabs)/groups/${item.id}`)} />
  ), [router]);

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-5 pt-14 pb-4">
        <Text className="text-text-primary text-[28px] font-extrabold tracking-tight">Grupos</Text>
        {totalCount > 0 && (
          <Text className="text-text-secondary text-sm mt-0.5 mb-4">
            {totalCount} {totalCount === 1 ? 'grupo' : 'grupos'}
          </Text>
        )}
        <View className={totalCount > 0 ? '' : 'mt-4'}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar grupo pelo nome..."
            autoCapitalize="sentences"
          />
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: 110 }}
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
              cta={debouncedQuery.trim() ? undefined : 'Criar grupo'}
              onPress={() => router.push('/(tabs)/groups/create')}
            />
          )
        }
      />

      <Fab icon="add" onPress={() => router.push('/(tabs)/groups/create')} accessibilityLabel="Criar grupo" />
      <AdBanner />
    </View>
  );
}
