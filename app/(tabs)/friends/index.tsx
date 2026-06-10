import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFriends, useFriendRequestsCount, useFriendActions } from '@features/friends/hooks/useFriends';
import { useUserSearch } from '@features/friends/hooks/useUserSearch';
import { useDebounce } from '@shared/hooks/useDebounce';
import { Avatar } from '@shared/components/Avatar';
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
    <View
      className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-4 py-3 mb-2"
    >
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/friends/${item.user.id}?friendshipId=${item.id}&favorite=${item.favorite ? '1' : '0'}`)}
        className="flex-row items-center flex-1"
        activeOpacity={0.75}
      >
        <View className="mr-3">
          <Avatar name={item.user.name} avatarUrl={item.user.avatarUrl} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold">{item.user.name}</Text>
          <Text className="text-text-secondary text-xs">{item.user.username}</Text>
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
          size={22}
          color={item.favorite ? '#FACC15' : '#A1A1AA'}
        />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
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
      <View className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-4 py-3 mb-2">
        <View className="mr-3">
          <Avatar name={item.name} avatarUrl={item.avatarUrl} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold">{item.name}</Text>
          <Text className="text-text-secondary text-xs">{item.username}</Text>
        </View>
        {isAccepted ? (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/friends/${item.id}?friendshipId=${item.friendshipId}&favorite=${item.favorite ? '1' : '0'}`)}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated flex-row items-center gap-1"
          >
            <Text className="text-xs font-semibold text-status-success">Amigos</Text>
            <Ionicons name="chevron-forward" size={12} color="#22C55E" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={isPendingSent ? undefined : handleAdd}
            disabled={isPendingSent}
            className={`px-3 py-1.5 rounded-lg ${isPendingSent ? 'bg-surface-elevated' : 'bg-brand-primary'}`}
          >
            <Text className={`text-xs font-semibold ${isPendingSent ? 'text-text-secondary' : 'text-white'}`}>
              {isPendingSent ? 'Aguardando' : 'Adicionar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [sendRequest, sentIds, router]);

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-2xl font-bold">Amigos</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/friends/requests')} className="relative">
            <Ionicons name="notifications-outline" size={24} color="#FAFAFA" />
            {requestCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full items-center justify-center">
                <Text className="text-white font-bold" style={{ fontSize: 9 }}>
                  {requestCount > 9 ? '9+' : requestCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-3 py-2">
          <Ionicons name="search" size={18} color="#A1A1AA" />
          <TextInput
            className="flex-1 text-text-primary ml-2 text-sm"
            placeholder="Buscar por username..."
            placeholderTextColor="#A1A1AA"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListHeaderComponent={
            searching
              ? <ActivityIndicator color="#F97316" style={{ marginVertical: 16 }} />
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={loadingFriends} onRefresh={refetch} tintColor="#F97316" />}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color="#F97316" style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            loadingFriends ? (
              <ActivityIndicator color="#F97316" style={{ marginTop: 32 }} />
            ) : (
              <View className="items-center mt-16">
                <Ionicons name="people-outline" size={48} color="#3F3F46" />
                <Text className="text-text-secondary mt-4 text-center">
                  Nenhum amigo ainda.{'\n'}Busque pelo username para adicionar.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
