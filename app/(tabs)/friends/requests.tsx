import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFriendRequests, useSentRequests, useFriendActions } from '@features/friends/hooks/useFriends';
import { Avatar } from '@shared/components/Avatar';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
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
    <View className="flex-row items-center bg-surface-card rounded-[20px] px-4 py-3 mb-2">
      <View className="mr-3">
        <Avatar name={item.user.name} avatarUrl={item.user.avatarUrl} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-[15px]">{item.user.name}</Text>
        <Text className="text-text-secondary text-xs mt-0.5">{item.user.username}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => rejectRequest.mutate(item.id)}
          disabled={rejectRequest.isPending || acceptRequest.isPending}
          className="w-10 h-10 bg-surface-elevated rounded-full items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Recusar solicitação"
        >
          <Ionicons name="close" size={17} color={colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => acceptRequest.mutate(item.id)}
          disabled={acceptRequest.isPending || rejectRequest.isPending}
          className="w-10 h-10 bg-brand-primary rounded-full items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Aceitar solicitação"
        >
          <Ionicons name="checkmark" size={17} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [acceptRequest, rejectRequest]);

  const renderSent = useCallback(({ item }: { item: Friendship }) => (
    <View className="flex-row items-center bg-surface-card rounded-[20px] px-4 py-3 mb-2">
      <View className="mr-3">
        <Avatar name={item.user.name} avatarUrl={item.user.avatarUrl} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-[15px]">{item.user.name}</Text>
        <Text className="text-text-secondary text-xs mt-0.5">{item.user.username}</Text>
      </View>
      <View className="px-3.5 py-2 rounded-full bg-surface-elevated">
        <Text className="text-xs font-semibold text-text-secondary">Aguardando</Text>
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
      <ScreenHeader title="Solicitações" onBack={() => router.back()} />

      {/* Tabs */}
      <View className="flex-row mx-5 mb-4 bg-surface-card rounded-full p-1">
        {(['received', 'sent'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full items-center ${activeTab === tab ? 'bg-surface-elevated' : ''}`}
          >
            <Text className={`text-[13px] font-semibold ${activeTab === tab ? 'text-text-primary' : 'text-text-secondary'}`}>
              {tab === 'received' ? `Recebidas${receivedCount > 0 ? ` (${receivedCount})` : ''}` : 'Enviadas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        onEndReached={() => { if (isReceived && hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isReceived && isFetchingNextPage ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 32 }} />
          ) : (
            <EmptyState icon="mail-open-outline" title={emptyLabel} />
          )
        }
      />
    </View>
  );
}
