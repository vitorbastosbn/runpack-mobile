import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGroup, useGroupRuns } from '@features/groups/hooks/useGroups';
import { Avatar } from '@shared/components/Avatar';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
import { formatDistance } from '@shared/utils/format';
import type { GroupRunSummary } from '@features/groups/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function GroupRunsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: group } = useGroup(id);
  const { data: runs = [], isLoading } = useGroupRuns(id);

  const renderRun = useCallback(({ item }: { item: GroupRunSummary }) => (
    <TouchableOpacity
      className="bg-surface-card rounded-[20px] p-5 mb-2.5"
      onPress={() => router.push(`/(tabs)/groups/${id}/runs/${item.sessionId}`)}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text-secondary text-xs">{formatDate(item.finishedAt)}</Text>
        <View className="flex-row items-center gap-2">
          {item.distanceGoalM ? (
            <View className="bg-surface-elevated rounded-full px-2.5 py-0.5">
              <Text className="text-text-secondary text-[11px] font-semibold">
                Meta {formatDistance(item.distanceGoalM)}
              </Text>
            </View>
          ) : null}
          <Text className="text-text-secondary text-xs">
            {item.participantCount} {item.participantCount === 1 ? 'corredor' : 'corredores'}
          </Text>
        </View>
      </View>

      {item.winnerUsername ? (
        <View className="flex-row items-center">
          <View
            style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F5C518' }}
            className="items-center justify-center"
          >
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '800' }}>1</Text>
          </View>
          <View className="ml-2.5">
            <Avatar name={item.winnerName ?? '?'} avatarUrl={item.winnerAvatarUrl} size={26} />
          </View>
          <Text className="text-text-primary text-sm ml-2.5 flex-1" numberOfLines={1}>
            {item.winnerUsername}
          </Text>
          {item.winnerDistanceM != null && (
            <Text
              className="text-text-primary text-sm font-extrabold"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatDistance(item.winnerDistanceM)}
            </Text>
          )}
        </View>
      ) : (
        <Text className="text-text-secondary text-sm">Sem resultados</Text>
      )}
    </TouchableOpacity>
  ), [router, id]);

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader
        title="Histórico de corridas"
        subtitle={group?.name}
        onBack={() => router.back()}
      />

      <FlatList
        data={runs}
        keyExtractor={(item) => item.sessionId}
        renderItem={renderRun}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 32 }} />
          ) : (
            <EmptyState icon="flag-outline" title="Nenhuma corrida concluída ainda" />
          )
        }
      />
      <AdBanner />
    </View>
  );
}
