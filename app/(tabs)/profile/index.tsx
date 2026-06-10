import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { useWeeklyStats } from '@features/profile/hooks/useWeeklyStats';
import { useMyAchievements } from '@features/achievements/hooks/useMyAchievements';
import { SectionLabel } from '@shared/components/SectionLabel';
import { EmptyState } from '@shared/components/EmptyState';
import { colors } from '@constants/theme';
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
  const hasRun = distanceM > 0;
  return (
    <View className="flex-1 justify-end h-20 mx-0.5">
      <View
        className={`rounded-full w-full ${hasRun ? 'bg-brand-primary' : 'bg-surface-elevated'}`}
        style={{ height: `${Math.max(pct, 4)}%` }}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 bg-surface-card rounded-[20px] px-3 py-4 items-center">
      <Text
        className="text-text-primary text-xl font-extrabold"
        style={{ fontVariant: ['tabular-nums'] }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text
        className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
        style={{ letterSpacing: 1 }}
      >
        {label}
      </Text>
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
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  const maxWeekDistance = Math.max(...(weeklyStats?.map((w) => w.totalDistanceM) ?? [0]), 1);
  const periodTotalM = weeklyStats?.reduce((acc, w) => acc + w.totalDistanceM, 0) ?? 0;

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Header */}
      <View className="flex-row items-center justify-end px-5 pt-14 pb-2">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile/settings')}
          className="w-9 h-9 rounded-full bg-surface-card items-center justify-center"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Configurações"
        >
          <Ionicons name="settings-outline" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + identity */}
        <View className="items-center pt-2 pb-7 px-6">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} className="w-24 h-24 rounded-full mb-4" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-surface-elevated items-center justify-center mb-4">
              <Text className="text-text-primary text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-text-primary text-[22px] font-extrabold tracking-tight">{profile.name}</Text>
          <Text className="text-text-secondary text-sm mt-1">@{profile.username}</Text>
          <Text className="text-text-disabled text-xs mt-1.5">
            Membro desde{' '}
            {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 gap-2.5 mb-7">
          <Stat label="Corridas" value={profile.totalRuns} />
          <Stat label="Total" value={formatDistance(profile.totalDistanceM)} />
          <Stat label="Pace" value={profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--'} />
        </View>

        {/* Weekly chart */}
        {weeklyStats && weeklyStats.length > 0 && (
          <View className="mx-5 mb-7">
            <SectionLabel label="Últimas 8 semanas" />
            <View className="bg-surface-card rounded-[20px] p-5">
              <View className="flex-row items-end h-20">
                {weeklyStats.map((w) => (
                  <WeekBar key={w.weekStart} distanceM={w.totalDistanceM} maxDistance={maxWeekDistance} />
                ))}
              </View>
              <View className="flex-row justify-between mt-3">
                <Text className="text-text-disabled text-xs">
                  {new Date(weeklyStats[0].weekStart).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
                {periodTotalM > 0 && (
                  <Text className="text-text-secondary text-xs font-semibold">
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
          </View>
        )}

        {/* Achievements */}
        <View className="mx-5 mb-7">
          <SectionLabel
            label="Conquistas"
            action="Ver todas"
            onAction={() => router.push('/(tabs)/profile/achievements' as any)}
          />

          {!achievements || achievements.length === 0 ? (
            <EmptyState
              card
              icon="lock-closed-outline"
              title="Nenhuma conquista ainda"
              subtitle="Complete corridas para desbloquear conquistas"
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
              {achievements.slice(0, 6).map((a) => (
                <View key={a.id} style={{ width: '33.33%', padding: 4 }}>
                  <View
                    className="bg-surface-card rounded-[20px] items-center justify-center"
                    style={{ aspectRatio: 1, gap: 8 }}
                  >
                    <View className="w-11 h-11 rounded-full bg-surface-elevated items-center justify-center">
                      <Ionicons
                        name={(ACHIEVEMENT_ICONS[a.slug] ?? 'star') as any}
                        size={20}
                        color={colors.brand.primary}
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
