import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMyAchievements } from '@features/achievements/hooks/useMyAchievements';
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
    <View className="bg-surface-card rounded-2xl px-4 py-3.5 mb-3 mx-4 flex-row items-center gap-4">
      <View className="w-12 h-12 rounded-full bg-surface-elevated items-center justify-center">
        <Ionicons
          name={(ACHIEVEMENT_ICONS[item.slug] ?? 'star') as any}
          size={24}
          color="#F97316"
        />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold">{item.name}</Text>
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
      {/* Fixed header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-surface-bg">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-text-primary text-xl font-bold">Conquistas</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#F97316" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-text-primary text-base text-center mb-4">
            Erro ao carregar conquistas
          </Text>
          <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-xl" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="trophy-outline" size={48} color="#3F3F46" />
          <Text className="text-text-primary text-lg font-semibold mt-4 mb-2">
            Nenhuma conquista ainda
          </Text>
          <Text className="text-text-secondary text-sm text-center">
            Complete corridas para desbloquear conquistas
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AchievementCard item={item} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        />
      )}
    </View>
  );
}
