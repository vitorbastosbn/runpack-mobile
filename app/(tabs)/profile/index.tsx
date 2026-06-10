import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

function SectionHeader({ title, icon, iconColor = '#F97316' }: { title: string; icon: string; iconColor?: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <Ionicons name={icon as any} size={16} color={iconColor} />
      <Text className="text-text-primary font-bold text-base">{title}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();
  const { data: weeklyStats } = useWeeklyStats();
  const { data: achievements } = useMyAchievements();

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
    <View className="flex-1 bg-surface-bg">
      {/* Header */}
      <View className="flex-row items-center justify-end px-4 pt-14 pb-2">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile/settings')}
          className="p-2"
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={22} color="#A1A1AA" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + identity */}
        <View className="items-center pt-4 pb-6 px-6">
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
            <Text className="text-brand-green text-2xl font-bold">{profile.totalRuns}</Text>
            <Text className="text-text-secondary text-xs mt-1">corridas</Text>
          </View>
          <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
            <Text
              className="text-brand-cyan text-2xl font-bold"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatDistance(profile.totalDistanceM)}
            </Text>
            <Text className="text-text-secondary text-xs mt-1">total</Text>
          </View>
          <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
            <Text
              className="text-brand-amber text-2xl font-bold"
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
            <SectionHeader title="Últimas 8 semanas" icon="bar-chart" iconColor="#06B6D4" />
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
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="trophy" size={16} color="#A855F7" />
              <Text className="text-text-primary font-bold text-base">Conquistas</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile/achievements' as any)} hitSlop={8}>
              <Text className="text-brand-purple text-sm font-medium">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {!achievements || achievements.length === 0 ? (
            <View className="bg-surface-card rounded-2xl p-5 items-center gap-2">
              <Ionicons name="lock-closed-outline" size={28} color="#52525B" />
              <Text className="text-text-disabled text-sm text-center">
                Complete corridas para desbloquear conquistas
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
              {achievements.slice(0, 6).map((a) => (
                <View key={a.id} style={{ width: '33.33%', padding: 4 }}>
                  <View
                    className="bg-surface-card rounded-2xl items-center justify-center"
                    style={{ aspectRatio: 1, gap: 8 }}
                  >
                    <View className="w-12 h-12 rounded-full bg-surface-elevated items-center justify-center">
                      <Ionicons
                        name={(ACHIEVEMENT_ICONS[a.slug] ?? 'star') as any}
                        size={24}
                        color="#A855F7"
                      />
                    </View>
                    <Text
                      className="text-text-primary text-xs font-semibold text-center"
                      numberOfLines={2}
                      style={{ paddingHorizontal: 8 }}
                    >
                      {a.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
