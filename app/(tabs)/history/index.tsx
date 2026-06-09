import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRunHistory } from '@features/history/hooks/useRunHistory';
import type { RunSummary } from '@features/history/types';
import { formatDistance, formatDuration, formatPace, formatRank } from '@shared/utils/format';

function RunCard({ item, onPress }: { item: RunSummary; onPress: () => void }) {
  const date = new Date(item.startedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      className="bg-surface-card rounded-2xl mx-4 mb-3 flex-row overflow-hidden"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="w-1 bg-brand-primary" />
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-text-secondary text-xs mb-0.5">{date}</Text>
            {item.groupName && (
              <Text className="text-brand-primary text-xs font-medium">{item.groupName}</Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-xl">{formatRank(item.finalRank)}</Text>
            {item.totalParticipants > 1 && (
              <Text className="text-text-disabled text-xs">de {item.totalParticipants}</Text>
            )}
          </View>
        </View>

        <View className="flex-row gap-5">
          <View>
            <Text className="text-text-primary text-xl font-bold">
              {formatDistance(item.totalDistanceM)}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">distância</Text>
          </View>
          <View>
            <Text className="text-text-primary text-xl font-bold">
              {formatDuration(item.totalTimeMs)}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">tempo</Text>
          </View>
          <View>
            <Text className="text-text-primary text-xl font-bold">
              {formatPace(item.avgPaceSkm)}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">pace</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useRunHistory();

  const runs = data?.pages.flatMap((p) => p.content) ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-bg">
        <View className="px-4 pt-14 pb-4">
          <Text className="text-text-primary text-2xl font-bold">Histórico</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#F97316" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-surface-bg">
        <View className="px-4 pt-14 pb-4">
          <Text className="text-text-primary text-2xl font-bold">Histórico</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <Ionicons name="cloud-offline-outline" size={48} color="#52525B" />
          <Text className="text-text-primary text-base font-semibold text-center">
            Erro ao carregar histórico
          </Text>
          <TouchableOpacity
            className="bg-brand-primary px-6 py-3 rounded-xl"
            onPress={() => refetch()}
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (runs.length === 0) {
    return (
      <View className="flex-1 bg-surface-bg">
        <View className="px-4 pt-14 pb-4">
          <Text className="text-text-primary text-2xl font-bold">Histórico</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <Ionicons name="footsteps-outline" size={48} color="#52525B" />
          <Text className="text-text-primary text-lg font-semibold">Nenhuma corrida ainda</Text>
          <Text className="text-text-secondary text-sm text-center">
            Inicie uma corrida na home ou em um grupo
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Histórico</Text>
      </View>
      <FlatList
        data={runs}
        keyExtractor={(item) => item.sessionId}
        renderItem={({ item }) => (
          <RunCard
            item={item}
            onPress={() => router.push(`/(tabs)/history/${item.sessionId}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color="#F97316" style={{ marginBottom: 16 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
