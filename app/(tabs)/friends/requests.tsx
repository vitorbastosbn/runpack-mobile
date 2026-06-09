import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFriendRequests, useSentRequests, useFriendActions } from '@features/friends/hooks/useFriends';
import { Avatar } from '@shared/components/Avatar';
import type { Friendship } from '@features/friends/types';

type Tab = 'received' | 'sent';

export default function FriendRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('received');

  const {
    data: receivedData, isLoading: loadingReceived,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useFriendRequests();
  const received = receivedData?.pages.flatMap((p) => p.content) ?? [];
  const receivedCount = receivedData?.pages[0]?.totalElements ?? 0;
  const { data: sent = [], isLoading: loadingSent } = useSentRequests();
  const { acceptRequest, rejectRequest } = useFriendActions();

  const renderReceived = useCallback(({ item }: { item: Friendship }) => (
    <View className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-4 py-3 mb-2">
      <View className="mr-3">
        <Avatar name={item.user.name} avatarUrl={item.user.avatarUrl} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold">{item.user.name}</Text>
        <Text className="text-text-secondary text-xs">{item.user.username}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => rejectRequest.mutate(item.id)}
          disabled={rejectRequest.isPending || acceptRequest.isPending}
          className="w-9 h-9 bg-surface-elevated rounded-lg items-center justify-center"
        >
          <Ionicons name="close" size={18} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => acceptRequest.mutate(item.id)}
          disabled={acceptRequest.isPending || rejectRequest.isPending}
          className="w-9 h-9 bg-brand-primary rounded-lg items-center justify-center"
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [acceptRequest, rejectRequest]);

  const renderSent = useCallback(({ item }: { item: Friendship }) => (
    <View className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-4 py-3 mb-2">
      <View className="mr-3">
        <Avatar name={item.user.name} avatarUrl={item.user.avatarUrl} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold">{item.user.name}</Text>
        <Text className="text-text-secondary text-xs">{item.user.username}</Text>
      </View>
      <View className="px-3 py-1.5 rounded-lg bg-surface-elevated">
        <Text className="text-xs text-text-secondary">Aguardando</Text>
      </View>
    </View>
  ), []);

  const isReceived = activeTab === 'received';
  const isLoading = isReceived ? loadingReceived : loadingSent;
  const data = isReceived ? received : sent;
  const renderItem = isReceived ? renderReceived : renderSent;
  const emptyLabel = activeTab === 'received'
    ? 'Nenhuma solicitação recebida'
    : 'Nenhuma solicitação enviada';

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Solicitações</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mb-4 bg-surface-card border border-surface-border rounded-xl p-1">
        {(['received', 'sent'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-brand-primary' : ''}`}
          >
            <Text className={`text-sm font-semibold ${activeTab === tab ? 'text-white' : 'text-text-secondary'}`}>
              {tab === 'received' ? `Recebidas${receivedCount > 0 ? ` (${receivedCount})` : ''}` : 'Enviadas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        onEndReached={() => { if (isReceived && hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isReceived && isFetchingNextPage ? (
            <ActivityIndicator color="#F97316" style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#F97316" style={{ marginTop: 32 }} />
          ) : (
            <View className="items-center mt-16">
              <Ionicons name="mail-open-outline" size={48} color="#3F3F46" />
              <Text className="text-text-secondary mt-4">{emptyLabel}</Text>
            </View>
          )
        }
      />
    </View>
  );
}
