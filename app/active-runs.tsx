import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveRuns } from '@features/sessions/hooks/useActiveRuns';
import { useJoinSession } from '@features/sessions/hooks/useCreateSession';
import type { ActiveRun } from '@features/sessions/types';

export default function ActiveRunsScreen() {
  const router = useRouter();
  const { data: runs = [], isLoading, refetch, isRefetching } = useActiveRuns();
  const { joinSession, isLoading: isJoining } = useJoinSession();

  const renderRun = useCallback(({ item }: { item: ActiveRun }) => (
    <TouchableOpacity
      className="bg-surface-card rounded-2xl mb-3 flex-row overflow-hidden"
      onPress={() => joinSession(item.sessionId)}
      disabled={isJoining}
      activeOpacity={0.85}
    >
      <View className="w-1 bg-status-success" />
      <View className="flex-1 p-4 flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#22C55E' }} />
            <Text className="text-status-success text-xs font-bold">Ao vivo</Text>
          </View>
          <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
            {item.groupName ?? item.creatorName}
          </Text>
          <Text className="text-text-secondary text-xs mt-0.5">
            {item.participantCount} {item.participantCount === 1 ? 'correndo' : 'correndo'}
          </Text>
        </View>
        <View className="items-center justify-center px-1">
          {isJoining ? (
            <ActivityIndicator color="#F97316" size="small" />
          ) : (
            <Ionicons name="enter-outline" size={26} color="#F97316" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [joinSession, isJoining]);

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-text-primary text-xl font-bold flex-1" numberOfLines={1}>
          Corridas em andamento
        </Text>
      </View>

      <FlatList
        data={runs}
        keyExtractor={(item) => item.sessionId}
        renderItem={renderRun}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#F97316" style={{ marginTop: 32 }} />
          ) : (
            <View className="items-center mt-16">
              <Ionicons name="radio-outline" size={48} color="#3F3F46" />
              <Text className="text-text-secondary mt-4 text-center">
                Nenhuma corrida em andamento.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
