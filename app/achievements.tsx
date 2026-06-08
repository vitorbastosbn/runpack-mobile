import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useMyAchievements } from '@features/achievements/hooks/useMyAchievements';
import type { UserAchievement } from '@features/achievements/types';

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_run: '🏃',
  first_group_run: '👥',
  five_runs: '5️⃣',
  ten_km_total: '🔟',
  fifty_km_total: '💯',
  three_weeks_streak: '🔥',
  podium: '🥇',
  fast_five: '⚡',
};

function AchievementCard({ item }: { item: UserAchievement }) {
  const icon = ACHIEVEMENT_ICONS[item.slug] ?? '🏅';
  const date = new Date(item.unlockedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View className="bg-surface-card rounded-xl p-4 mb-3 mx-4 flex-row items-center gap-4">
      <Text className="text-4xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold">{item.name}</Text>
        <Text className="text-text-secondary text-xs mt-0.5">{item.description}</Text>
        <Text className="text-text-disabled text-xs mt-1">{date}</Text>
      </View>
    </View>
  );
}

export default function AchievementsScreen() {
  const { data, isLoading, isError, refetch } = useMyAchievements();

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
        <Text className="text-text-primary text-base text-center mb-4">Erro ao carregar conquistas</Text>
        <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-xl" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Text className="text-4xl mb-4">🏅</Text>
        <Text className="text-text-primary text-lg font-semibold mb-2">Nenhuma conquista ainda</Text>
        <Text className="text-text-secondary text-sm text-center">
          Complete corridas para desbloquear conquistas
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AchievementCard item={item} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      />
    </View>
  );
}
