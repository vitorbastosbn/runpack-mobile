import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroup, useGroupRuns } from '@features/groups/hooks/useGroups';
import { Avatar } from '@shared/components/Avatar';
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
      className="bg-surface-card border border-surface-border rounded-2xl p-4 mb-3"
      onPress={() => router.push(`/(tabs)/groups/${id}/runs/${item.sessionId}`)}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-text-secondary text-xs">{formatDate(item.finishedAt)}</Text>
        <View className="flex-row items-center gap-2">
          {item.distanceGoalM ? (
            <View className="bg-surface-elevated rounded-md px-2 py-0.5">
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
            style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FBBF24' }}
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
            <Text className="text-text-primary text-sm font-bold">
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
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-text-primary text-xl font-bold" numberOfLines={1}>
            Histórico de corridas
          </Text>
          {group?.name ? (
            <Text className="text-text-secondary text-xs" numberOfLines={1}>{group.name}</Text>
          ) : null}
        </View>
      </View>

      <FlatList
        data={runs}
        keyExtractor={(item) => item.sessionId}
        renderItem={renderRun}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#F97316" style={{ marginTop: 32 }} />
          ) : (
            <View className="items-center mt-16">
              <Ionicons name="flag-outline" size={48} color="#3F3F46" />
              <Text className="text-text-secondary mt-4 text-center">
                Nenhuma corrida concluída ainda.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
