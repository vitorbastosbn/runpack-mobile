import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@store/auth.store';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { useWeeklyStats } from '@features/profile/hooks/useWeeklyStats';
import { formatDistance, formatPace } from '@shared/utils/format';
import * as SecureStore from 'expo-secure-store';

function WeekBar({ distanceM, maxDistance }: { distanceM: number; maxDistance: number }) {
  const pct = maxDistance > 0 ? (distanceM / maxDistance) * 100 : 0;
  return (
    <View className="flex-1 justify-end h-16 mx-0.5">
      <View className="bg-surface-border rounded-sm overflow-hidden h-full relative">
        <View
          className="bg-brand-primary rounded-sm absolute bottom-0 w-full"
          style={{ height: `${pct}%` }}
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { clearAuth } = useAuthStore();
  const { data: profile, isLoading } = useMyProfile();
  const { data: weeklyStats } = useWeeklyStats();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwt');
    clearAuth();
  };

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  const maxWeekDistance = Math.max(...(weeklyStats?.map((w) => w.totalDistanceM) ?? [0]), 1);

  return (
    <ScrollView className="flex-1 bg-surface-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="items-center pt-8 pb-6 px-4">
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} className="w-20 h-20 rounded-full mb-3" />
        ) : (
          <View className="w-20 h-20 rounded-full bg-surface-elevated items-center justify-center mb-3">
            <Text className="text-text-primary text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-text-primary text-xl font-bold">{profile.name}</Text>
        <Text className="text-text-secondary text-sm">@{profile.username}</Text>
      </View>

      <View className="flex-row mx-4 gap-3 mb-6">
        <View className="flex-1 bg-surface-card rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">{profile.totalRuns}</Text>
          <Text className="text-text-secondary text-xs">corridas</Text>
        </View>
        <View className="flex-1 bg-surface-card rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">
            {formatDistance(profile.totalDistanceM)}
          </Text>
          <Text className="text-text-secondary text-xs">total</Text>
        </View>
        <View className="flex-1 bg-surface-card rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">
            {formatPace(profile.bestPaceSkm)}
          </Text>
          <Text className="text-text-secondary text-xs">melhor pace</Text>
        </View>
      </View>

      {weeklyStats && weeklyStats.length > 0 && (
        <View className="mx-4 bg-surface-card rounded-xl p-4 mb-6">
          <Text className="text-text-primary text-sm font-semibold mb-4">Últimas 8 semanas</Text>
          <View className="flex-row items-end h-16">
            {weeklyStats.map((w) => (
              <WeekBar key={w.weekStart} distanceM={w.totalDistanceM} maxDistance={maxWeekDistance} />
            ))}
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-text-disabled text-xs">
              {new Date(weeklyStats[0].weekStart).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
            <Text className="text-text-disabled text-xs">
              {new Date(weeklyStats[weeklyStats.length - 1].weekStart).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        className="mx-4 border border-status-error py-3 rounded-xl items-center"
        onPress={handleLogout}
      >
        <Text className="text-status-error font-semibold">Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
