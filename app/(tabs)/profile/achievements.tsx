import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMyAchievements } from '@features/achievements/hooks/useMyAchievements';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
import type { UserAchievement } from '@features/achievements/types';

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_run: 'footsteps',
  first_group_run: 'people',
  five_runs: 'medal',
  ten_km_total: 'trending-up',
  fifty_km_total: 'rocket',
  three_weeks_streak: 'flame',
  podium: 'trophy',
  fast_five: 'flash',
};

function AchievementCard({ item }: { item: UserAchievement }) {
  const date = new Date(item.unlockedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View className="bg-surface-card rounded-[20px] px-4 py-4 mb-2.5 mx-5 flex-row items-center gap-4">
      <View className="w-12 h-12 rounded-full bg-surface-elevated items-center justify-center">
        <Ionicons
          name={(ACHIEVEMENT_ICONS[item.slug] ?? 'star') as any}
          size={20}
          color={colors.brand.primary}
        />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-[15px]">{item.name}</Text>
        <Text className="text-text-secondary text-xs mt-0.5">{item.description}</Text>
        <Text className="text-text-disabled text-xs mt-1">{date}</Text>
      </View>
    </View>
  );
}

export default function AchievementsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMyAchievements();

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader title="Conquistas" onBack={() => router.back()} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            icon="cloud-offline-outline"
            title="Erro ao carregar conquistas"
            cta="Tentar novamente"
            onPress={() => refetch()}
          />
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 justify-center pb-24">
          <EmptyState
            icon="trophy-outline"
            title="Nenhuma conquista ainda"
            subtitle="Complete corridas para desbloquear conquistas"
          />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AchievementCard item={item} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        />
      )}
      <AdBanner />
    </View>
  );
}
