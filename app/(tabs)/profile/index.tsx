import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLogout } from '@features/auth/hooks/useLogout';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { useWeeklyStats } from '@features/profile/hooks/useWeeklyStats';
import { useMyAchievements } from '@features/achievements/hooks/useMyAchievements';
import { formatDistance, formatPace } from '@shared/utils/format';

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

function WeekBar({ distanceM, maxDistance }: { distanceM: number; maxDistance: number }) {
  const pct = maxDistance > 0 ? (distanceM / maxDistance) * 100 : 0;
  return (
    <View className="flex-1 justify-end h-20 mx-0.5">
      <View className="bg-surface-elevated rounded-sm overflow-hidden h-full relative">
        <View
          className="bg-brand-primary rounded-sm absolute bottom-0 w-full"
          style={{ height: `${Math.max(pct, 2)}%` }}
        />
      </View>
    </View>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <Ionicons name={icon as any} size={16} color="#F97316" />
      <Text className="text-text-primary font-bold text-base">{title}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { logout } = useLogout();
  const { data: profile, isLoading } = useMyProfile();
  const { data: weeklyStats } = useWeeklyStats();
  const { data: achievements } = useMyAchievements();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  const maxWeekDistance = Math.max(...(weeklyStats?.map((w) => w.totalDistanceM) ?? [0]), 1);
  const periodTotalM = weeklyStats?.reduce((acc, w) => acc + w.totalDistanceM, 0) ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-surface-bg"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + identity */}
      <View className="items-center pt-14 pb-6 px-6">
        <View className="p-0.5 rounded-full border-2 border-brand-primary mb-3">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} className="w-20 h-20 rounded-full" />
          ) : (
            <View className="w-20 h-20 rounded-full bg-surface-elevated items-center justify-center">
              <Text className="text-text-primary text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-text-primary text-xl font-bold">{profile.name}</Text>
        <Text className="text-text-secondary text-sm mt-0.5">@{profile.username}</Text>
        <Text className="text-text-disabled text-xs mt-1">
          Membro desde{' '}
          {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row mx-5 gap-3 mb-6">
        <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
          <Text className="text-brand-primary text-2xl font-bold">{profile.totalRuns}</Text>
          <Text className="text-text-secondary text-xs mt-1">corridas</Text>
        </View>
        <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
          <Text
            className="text-brand-primary text-2xl font-bold"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatDistance(profile.totalDistanceM)}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">total</Text>
        </View>
        <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
          <Text
            className="text-brand-primary text-2xl font-bold"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--'}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">melhor pace</Text>
        </View>
      </View>

      {/* Weekly chart */}
      {weeklyStats && weeklyStats.length > 0 && (
        <View className="mx-5 bg-surface-card rounded-2xl p-4 mb-6">
          <SectionHeader title="Últimas 8 semanas" icon="bar-chart" />
          <View className="flex-row items-end h-20">
            {weeklyStats.map((w) => (
              <WeekBar key={w.weekStart} distanceM={w.totalDistanceM} maxDistance={maxWeekDistance} />
            ))}
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-text-disabled text-xs">
              {new Date(weeklyStats[0].weekStart).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
            {periodTotalM > 0 && (
              <Text className="text-text-secondary text-xs">
                {formatDistance(periodTotalM)} no período
              </Text>
            )}
            <Text className="text-text-disabled text-xs">
              {new Date(weeklyStats[weeklyStats.length - 1].weekStart).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Achievements */}
      <View className="mx-5 mb-6">
        <SectionHeader title="Conquistas" icon="trophy" />
        {!achievements || achievements.length === 0 ? (
          <View className="bg-surface-card rounded-2xl p-5 items-center gap-2">
            <Ionicons name="lock-closed-outline" size={28} color="#52525B" />
            <Text className="text-text-disabled text-sm text-center">
              Complete corridas para desbloquear conquistas
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {achievements.map((a) => (
              <View
                key={a.id}
                className="bg-surface-card rounded-2xl px-4 py-3 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-full bg-surface-elevated items-center justify-center">
                  <Ionicons
                    name={(ACHIEVEMENT_ICONS[a.slug] ?? 'star') as any}
                    size={20}
                    color="#F97316"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold text-sm">{a.name}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">{a.description}</Text>
                </View>
                <Text className="text-text-disabled text-xs">
                  {new Date(a.unlockedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        className="mx-5 border border-status-error py-4 rounded-2xl items-center flex-row justify-center gap-2"
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text className="text-status-error font-semibold">Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
