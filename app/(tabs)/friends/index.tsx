import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFriends, useFriendRequestsCount, useFriendActions } from '@features/friends/hooks/useFriends';
import { useUserSearch } from '@features/friends/hooks/useUserSearch';
import { useDebounce } from '@shared/hooks/useDebounce';
import { Avatar } from '@shared/components/Avatar';
import { SearchBar } from '@shared/components/SearchBar';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
import type { Friendship, UserSearchResult } from '@features/friends/types';

export default function FriendsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const {
    data: friendsData, isLoading: loadingFriends, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useFriends();
  const friends = friendsData?.pages.flatMap((p) => p.content) ?? [];
  const { data: requestCount = 0 } = useFriendRequestsCount();
  const { data: searchResults = [], isFetching: searching } = useUserSearch(debouncedQuery);
  const { sendRequest, updateFavorite } = useFriendActions();

  const isSearching = debouncedQuery.trim().length >= 2;

  const renderFriend = useCallback(({ item }: { item: Friendship }) => (
    <View className="flex-row items-center bg-surface-card rounded-[20px] px-4 py-3 mb-2">
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/friends/${item.user.id}?friendshipId=${item.id}&favorite=${item.favorite ? '1' : '0'}`)}
        className="flex-row items-center flex-1"
        activeOpacity={0.75}
      >
        <View className="mr-3">
          <Avatar name={item.user.name} avatarUrl={item.user.avatarUrl} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-[15px]">{item.user.name}</Text>
          <Text className="text-text-secondary text-xs mt-0.5">{item.user.username}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => updateFavorite.mutate({ id: item.id, favorite: !item.favorite })}
        disabled={updateFavorite.isPending}
        hitSlop={10}
        className="w-10 h-10 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={item.favorite ? 'Parar de acompanhar corridas' : 'Acompanhar corridas'}
      >
        <Ionicons
          name={item.favorite ? 'star' : 'star-outline'}
          size={20}
          color={item.favorite ? colors.status.warning : colors.text.disabled}
        />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={15} color={colors.text.disabled} />
    </View>
  ), [router, updateFavorite]);

  const renderSearchResult = useCallback(({ item }: { item: UserSearchResult }) => {
    const isPendingSent = item.relation === 'pending_sent' || sentIds.has(item.id);
    const isAccepted = item.relation === 'accepted';

    const handleAdd = () => {
      setSentIds((prev) => new Set([...prev, item.id]));
      sendRequest.mutate(item.id, {
        onError: () => setSentIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; }),
      });
    };

    return (
      <View className="flex-row items-center bg-surface-card rounded-[20px] px-4 py-3 mb-2">
        <View className="mr-3">
          <Avatar name={item.name} avatarUrl={item.avatarUrl} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-[15px]">{item.name}</Text>
          <Text className="text-text-secondary text-xs mt-0.5">{item.username}</Text>
        </View>
        {isAccepted ? (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/friends/${item.id}?friendshipId=${item.friendshipId}&favorite=${item.favorite ? '1' : '0'}`)}
            className="px-3.5 py-2 rounded-full bg-surface-elevated flex-row items-center gap-1"
          >
            <Text className="text-xs font-semibold text-text-secondary">Amigos</Text>
            <Ionicons name="chevron-forward" size={11} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={isPendingSent ? undefined : handleAdd}
            disabled={isPendingSent}
            className={`px-3.5 py-2 rounded-full ${isPendingSent ? 'bg-surface-elevated' : 'bg-brand-primary'}`}
          >
            <Text className={`text-xs font-bold ${isPendingSent ? 'text-text-secondary' : 'text-white'}`}>
              {isPendingSent ? 'Aguardando' : 'Adicionar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [sendRequest, sentIds, router]);

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-end justify-between mb-4">
          <Text className="text-text-primary text-[28px] font-extrabold tracking-tight">Amigos</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/friends/requests')}
            className="w-10 h-10 rounded-full bg-surface-card items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Solicitações de amizade"
          >
            <Ionicons name="notifications-outline" size={19} color={colors.text.primary} />
            {requestCount > 0 && (
              <View className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-primary rounded-full items-center justify-center">
                <Text className="text-white font-bold" style={{ fontSize: 9 }}>
                  {requestCount > 9 ? '9+' : requestCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por username..." />
      </View>

      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListHeaderComponent={
            searching
              ? <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
              : searchResults.length === 0
                ? <Text className="text-text-secondary text-center mt-8">Nenhum usuário encontrado</Text>
                : null
          }
        />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={loadingFriends} onRefresh={refetch} tintColor={colors.brand.primary} />
          }
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage
              ? <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
              : null
          }
          ListEmptyComponent={
            loadingFriends ? (
              <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 32 }} />
            ) : (
              <EmptyState
                icon="people-outline"
                title="Nenhum amigo ainda"
                subtitle="Busque pelo username para adicionar."
              />
            )
          }
        />
      )}
      <AdBanner />
    </View>
  );
}
