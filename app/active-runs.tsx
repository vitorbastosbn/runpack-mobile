import { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveRuns } from '@features/sessions/hooks/useActiveRuns';
import { useJoinSession } from '@features/sessions/hooks/useCreateSession';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
import type { ActiveRun } from '@features/sessions/types';

export default function ActiveRunsScreen() {
  const router = useRouter();
  const { data: runs = [], isLoading, refetch, isRefetching } = useActiveRuns();
  const { joinSession, isLoading: isJoining } = useJoinSession();

  const renderRun = useCallback(({ item }: { item: ActiveRun }) => (
    <TouchableOpacity
      className="bg-surface-card rounded-[20px] mb-2.5 px-4 py-4 flex-row items-center justify-between gap-3"
      onPress={() => joinSession(item.sessionId)}
      disabled={isJoining}
      activeOpacity={0.85}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
          <Text
            className="text-status-success text-[10px] font-bold uppercase"
            style={{ letterSpacing: 1 }}
          >
            Ao vivo
          </Text>
        </View>
        <Text className="text-text-primary font-bold text-[15px]" numberOfLines={1}>
          {item.groupName ?? item.creatorName}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">
          {item.participantCount} correndo
        </Text>
      </View>
      <View className="w-10 h-10 rounded-full bg-surface-elevated items-center justify-center">
        {isJoining ? (
          <ActivityIndicator color={colors.brand.primary} size="small" />
        ) : (
          <Ionicons name="arrow-forward" size={18} color={colors.brand.primary} />
        )}
      </View>
    </TouchableOpacity>
  ), [joinSession, isJoining]);

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader title="Corridas em andamento" onBack={() => router.back()} />

      <FlatList
        data={runs}
        keyExtractor={(item) => item.sessionId}
        renderItem={renderRun}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 32 }} />
          ) : (
            <EmptyState icon="radio-outline" title="Nenhuma corrida em andamento" />
          )
        }
      />
      <AdBanner />
    </View>
  );
}
