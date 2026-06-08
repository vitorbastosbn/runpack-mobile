import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRunHistory } from '@features/history/hooks/useRunHistory';
import type { RunSummary } from '@features/history/types';
import { formatDistance, formatDuration, formatRank } from '@shared/utils/format';

function RunCard({ item, onPress }: { item: RunSummary; onPress: () => void }) {
  const date = new Date(item.startedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      className="bg-surface-card rounded-xl p-4 mb-3 mx-4"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-text-secondary text-xs">{date}</Text>
        <Text className="text-xl">{formatRank(item.finalRank)}</Text>
      </View>
      {item.groupName && (
        <Text className="text-brand-primary text-xs font-medium mb-2">{item.groupName}</Text>
      )}
      <View className="flex-row gap-6">
        <View>
          <Text className="text-text-primary text-2xl font-bold">
            {formatDistance(item.totalDistanceM)}
          </Text>
          <Text className="text-text-secondary text-xs">distância</Text>
        </View>
        <View>
          <Text className="text-text-primary text-2xl font-bold">
            {formatDuration(item.totalTimeMs)}
          </Text>
          <Text className="text-text-secondary text-xs">tempo</Text>
        </View>
      </View>
      <Text className="text-text-disabled text-xs mt-2">
        {item.finalRank}º de {item.totalParticipants} participante{item.totalParticipants !== 1 ? 's' : ''}
      </Text>
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
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Text className="text-text-primary text-base text-center mb-4">
          Erro ao carregar histórico
        </Text>
        <TouchableOpacity
          className="bg-brand-primary px-6 py-3 rounded-xl"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (runs.length === 0) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Text className="text-4xl mb-4">🏃</Text>
        <Text className="text-text-primary text-lg font-semibold mb-2">Nenhuma corrida ainda</Text>
        <Text className="text-text-secondary text-sm text-center">
          Inicie uma corrida na home ou em um grupo
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      <FlatList
        data={runs}
        keyExtractor={(item) => item.sessionId}
        renderItem={({ item }) =>
          <RunCard
            item={item}
            onPress={() => router.push(`/(tabs)/history/${item.sessionId}`)}
          />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage
            ? <ActivityIndicator color="#F97316" style={{ marginBottom: 16 }} />
            : null
        }
      />
    </View>
  );
}
