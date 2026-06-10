import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRunHistory } from '@features/history/hooks/useRunHistory';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
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
      className="bg-surface-card rounded-[20px] mx-5 mb-2.5 p-5"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-text-secondary text-xs">{date}</Text>
          {item.groupName && (
            <Text className="text-brand-primary text-xs font-semibold mt-0.5">{item.groupName}</Text>
          )}
        </View>
        <Text className="text-xl">{formatRank(item.finalRank)}</Text>
      </View>

      <View className="flex-row gap-6">
        <View>
          <Text
            className="text-text-primary text-xl font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatDistance(item.totalDistanceM)}
          </Text>
          <Text
            className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
            style={{ letterSpacing: 1 }}
          >
            Distância
          </Text>
        </View>
        <View>
          <Text
            className="text-text-primary text-xl font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatDuration(item.totalTimeMs)}
          </Text>
          <Text
            className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
            style={{ letterSpacing: 1 }}
          >
            Tempo
          </Text>
        </View>
        <View>
          <Text
            className="text-text-primary text-xl font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatPace(item.avgPaceSkm)}
          </Text>
          <Text
            className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
            style={{ letterSpacing: 1 }}
          >
            Pace
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Header() {
  return (
    <View className="px-5 pt-14 pb-4">
      <Text className="text-text-primary text-[28px] font-extrabold tracking-tight">Histórico</Text>
    </View>
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
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-surface-bg">
        <Header />
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            icon="cloud-offline-outline"
            title="Erro ao carregar histórico"
            cta="Tentar novamente"
            onPress={() => refetch()}
          />
        </View>
      </View>
    );
  }

  if (runs.length === 0) {
    return (
      <View className="flex-1 bg-surface-bg">
        <Header />
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            icon="footsteps-outline"
            title="Nenhuma corrida ainda"
            subtitle="Inicie uma corrida na home ou em um grupo"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      <Header />
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
            <ActivityIndicator color={colors.brand.primary} style={{ marginBottom: 16 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
