import { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRunHistory } from '@features/history/hooks/useRunHistory';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
import type { RunSummary } from '@features/history/types';
import { formatDistance, formatDuration, formatPace, formatRank } from '@shared/utils/format';

type Row =
  | { type: 'month'; key: string; label: string }
  | { type: 'run'; key: string; run: RunSummary };

function monthLabel(iso: string): string {
  const label = new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function RunRow({ run, onPress }: { run: RunSummary; onPress: () => void }) {
  const d = new Date(run.startedAt);
  const day = d.getDate().toString().padStart(2, '0');
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

  return (
    <TouchableOpacity
      className="flex-row items-center px-5 py-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Day column — diary look */}
      <View className="w-11 items-center">
        <Text
          className="text-text-primary text-[20px] font-extrabold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {day}
        </Text>
        <Text
          className="text-text-secondary text-[10px] font-semibold uppercase"
          style={{ letterSpacing: 0.8 }}
        >
          {weekday}
        </Text>
      </View>

      <View className="flex-1 ml-4 mr-3">
        <Text
          className="text-text-primary text-[17px] font-extrabold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatDistance(run.totalDistanceM)}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
          {formatDuration(run.totalTimeMs)} · {formatPace(run.avgPaceSkm)}
          {run.groupName ? ` · ${run.groupName}` : ''}
        </Text>
      </View>

      <Text className="text-xl">{formatRank(run.finalRank)}</Text>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useRunHistory();

  const runs = useMemo(() => data?.pages.flatMap((p) => p.content) ?? [], [data]);

  // Timeline agrupada por mês — marcador antes do primeiro item de cada mês.
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let currentMonth = '';
    for (const run of runs) {
      const label = monthLabel(run.startedAt);
      if (label !== currentMonth) {
        currentMonth = label;
        out.push({ type: 'month', key: `month-${label}`, label });
      }
      out.push({ type: 'run', key: run.sessionId, run });
    }
    return out;
  }, [runs]);

  const renderRow = ({ item }: { item: Row }) => {
    if (item.type === 'month') {
      return (
        <Text
          className="text-text-secondary text-[11px] font-semibold uppercase px-5 pt-6 pb-2"
          style={{ letterSpacing: 1.4 }}
        >
          {item.label}
        </Text>
      );
    }
    return (
      <RunRow
        run={item.run}
        onPress={() => router.push(`/(tabs)/history/${item.run.sessionId}`)}
      />
    );
  };

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-5 pt-14 pb-2">
        <Text className="text-text-primary text-[28px] font-extrabold tracking-tight">Histórico</Text>
        {runs.length > 0 && (
          <Text className="text-text-secondary text-sm mt-0.5">
            {runs.length} {runs.length === 1 ? 'corrida' : 'corridas'}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            icon="cloud-offline-outline"
            title="Erro ao carregar histórico"
            cta="Tentar novamente"
            onPress={() => refetch()}
          />
        </View>
      ) : runs.length === 0 ? (
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            icon="footsteps-outline"
            title="Nenhuma corrida ainda"
            subtitle="Inicie uma corrida na home ou em um grupo"
          />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.key}
          renderItem={renderRow}
          ItemSeparatorComponent={null}
          contentContainerStyle={{ paddingBottom: 40 }}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
