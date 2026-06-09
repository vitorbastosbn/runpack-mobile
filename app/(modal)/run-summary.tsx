import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '@store/session.store';
import { useSessionAchievements } from '@features/achievements/hooks/useSessionAchievements';
import { useRunDetail } from '@features/history/hooks/useRunDetail';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function formatPace(paceSKm: number): string {
  if (paceSKm <= 0) return '--:--/km';
  const m = Math.floor(paceSKm / 60);
  const s = Math.floor(paceSKm % 60).toString().padStart(2, '0');
  return `${m}:${s}/km`;
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_run: '🏃', first_group_run: '👥', five_runs: '5️⃣',
  ten_km_total: '🔟', fifty_km_total: '💯', three_weeks_streak: '🔥',
  podium: '🥇', fast_five: '⚡',
};

export default function RunSummaryScreen() {
  const router = useRouter();
  const { sessionId, elapsedMs, distanceM, paceSKm, ranking, groupName, clearSession } = useSessionStore();

  // Poll once after 2s delay so async achievement evaluation has time to complete
  const { data: achievements } = useSessionAchievements(sessionId ?? '', !!sessionId);
  const { data: runDetail } = useRunDetail(sessionId ?? '');
  const finalRanking = runDetail?.participants ?? [];

  return (
    <ScrollView className="flex-1 bg-surface-bg" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-6 pt-16 pb-8 items-center">
        <View className="w-20 h-20 rounded-full bg-brand-primary/20 border-2 border-brand-primary items-center justify-center mb-4">
          <Ionicons name="flag" size={36} color="#F97316" />
        </View>
        <Text className="text-text-primary text-2xl font-bold">Corrida finalizada!</Text>
        {groupName && (
          <Text className="text-text-secondary text-sm mt-1">{groupName}</Text>
        )}
      </View>

      <View className="mx-4 mb-6">
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-surface-card border border-surface-border rounded-xl p-4 items-center">
            <Text className="text-brand-primary text-2xl font-bold">
              {(distanceM / 1000).toFixed(2)}km
            </Text>
            <Text className="text-text-secondary text-xs mt-1">Distância</Text>
          </View>
          <View className="flex-1 bg-surface-card border border-surface-border rounded-xl p-4 items-center">
            <Text className="text-text-primary text-2xl font-bold">{formatTime(elapsedMs)}</Text>
            <Text className="text-text-secondary text-xs mt-1">Tempo</Text>
          </View>
        </View>
        <View className="bg-surface-card border border-surface-border rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">{formatPace(paceSKm)}</Text>
          <Text className="text-text-secondary text-xs mt-1">Pace médio</Text>
        </View>
      </View>

      {(finalRanking.length > 0 || ranking.length > 0) && (
        <View className="mx-4 mb-6">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Resultado final
          </Text>
          {finalRanking.length > 0
            ? finalRanking.map((entry) => (
                <View
                  key={entry.userId}
                  className="flex-row items-center px-4 py-3 mb-2 bg-surface-card border border-surface-border rounded-xl"
                >
                  <Text className="text-text-secondary w-6 text-sm font-bold">#{entry.finalRank}</Text>
                  <View className="flex-1 ml-3">
                    <Text className="text-text-primary font-semibold text-sm">{entry.username}</Text>
                  </View>
                  <Text className="text-text-primary font-bold">
                    {(entry.totalDistanceM / 1000).toFixed(2)}km
                  </Text>
                </View>
              ))
            : ranking.map((entry) => (
                <View
                  key={entry.userId}
                  className="flex-row items-center px-4 py-3 mb-2 bg-surface-card border border-surface-border rounded-xl"
                >
                  <Text className="text-text-secondary w-6 text-sm font-bold">#{entry.rank}</Text>
                  <View className="flex-1 ml-3">
                    <Text className="text-text-primary font-semibold text-sm">{entry.username}</Text>
                  </View>
                  <Text className="text-text-primary font-bold">
                    {(entry.distanceM / 1000).toFixed(2)}km
                  </Text>
                </View>
              ))}
        </View>
      )}

      {achievements && achievements.length > 0 && (
        <View className="mx-4 mb-6">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Conquistas desbloqueadas
          </Text>
          {achievements.map((a) => (
            <View
              key={a.id}
              className="flex-row items-center bg-surface-card border border-brand-primary/30 rounded-xl px-4 py-3 mb-2 gap-3"
            >
              <Text className="text-2xl">{ACHIEVEMENT_ICONS[a.slug] ?? '🏅'}</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-sm">{a.name}</Text>
                <Text className="text-text-secondary text-xs">{a.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="mx-4 gap-3">
        <TouchableOpacity
          className="w-full bg-brand-primary rounded-xl py-4 items-center"
          onPress={() => { clearSession(); router.replace('/(tabs)/home'); }}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold">Ir para o início</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
