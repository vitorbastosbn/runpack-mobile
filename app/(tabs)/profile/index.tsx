import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { useWeeklyStats } from '@features/profile/hooks/useWeeklyStats';
import { useMyAchievements } from '@features/achievements/hooks/useMyAchievements';
import { SectionLabel } from '@shared/components/SectionLabel';
import { colors } from '@constants/theme';
import { formatDistance, formatPace } from '@shared/utils/format';
import { AdBanner } from '@shared/components/AdBanner';
import { PremiumBadge } from '@features/subscription/components/PremiumBadge';
import { useSubscriptionStore } from '@store/subscription.store';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Catálogo fechado do MVP — permite exibir conquistas bloqueadas como objetivo.
const ACHIEVEMENT_CATALOG: { slug: string; name: string; icon: IoniconsName }[] = [
  { slug: 'first_run', name: 'Primeira corrida', icon: 'footsteps' },
  { slug: 'first_group_run', name: 'Em grupo', icon: 'people' },
  { slug: 'five_runs', name: '5 corridas', icon: 'medal' },
  { slug: 'ten_km_total', name: '10 km no total', icon: 'trending-up' },
  { slug: 'fifty_km_total', name: '50 km no total', icon: 'rocket' },
  { slug: 'three_weeks_streak', name: '3 semanas seguidas', icon: 'flame' },
  { slug: 'podium', name: 'Pódio', icon: 'trophy' },
  { slug: 'fast_five', name: '5 km em 30 min', icon: 'flash' },
];

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
}

function formatKm(totalDistanceM: number): string {
  const km = totalDistanceM / 1000;
  return km.toLocaleString('pt-BR', {
    minimumFractionDigits: km > 0 && km < 100 ? 1 : 0,
    maximumFractionDigits: km < 100 ? 1 : 0,
  });
}

/* ---------------------------------- blocks --------------------------------- */

function IdentityHeader({
  name,
  username,
  avatarUrl,
  createdAt,
}: {
  name: string;
  username: string;
  avatarUrl?: string | null;
  createdAt: string;
}) {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  return (
    <View className="flex-row items-center px-5 gap-4">
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} className="w-16 h-16 rounded-full" />
      ) : (
        <View className="w-16 h-16 rounded-full bg-surface-elevated items-center justify-center">
          <Text className="text-text-primary text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-text-primary text-[24px] font-extrabold tracking-tight shrink"
            numberOfLines={1}
          >
            {name}
          </Text>
          {isPremium && <PremiumBadge />}
        </View>
        <Text className="text-text-secondary text-[13px] mt-0.5" numberOfLines={1}>
          @{username} · desde {formatMemberSince(createdAt)}
        </Text>
      </View>
    </View>
  );
}

function Odometer({ totalDistanceM }: { totalDistanceM: number }) {
  return (
    <View className="px-5 pt-9 pb-8">
      <View className="flex-row items-baseline">
        <Text
          className="text-text-primary font-extrabold"
          style={{ fontSize: 64, lineHeight: 68, letterSpacing: -2.5, fontVariant: ['tabular-nums'] }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatKm(totalDistanceM)}
        </Text>
        <Text className="text-brand-primary text-2xl font-extrabold ml-1.5">km</Text>
      </View>
      <Text
        className="text-text-secondary text-[11px] font-semibold uppercase mt-1"
        style={{ letterSpacing: 1.6 }}
      >
        Percorridos até hoje
      </Text>
    </View>
  );
}

function StatStrip({
  totalRuns,
  bestPaceSkm,
  activeWeeks,
}: {
  totalRuns: number;
  bestPaceSkm: number;
  activeWeeks: number | null;
}) {
  const items: { label: string; value: string }[] = [
    { label: 'Corridas', value: String(totalRuns) },
    { label: 'Melhor pace', value: bestPaceSkm > 0 ? formatPace(bestPaceSkm) : '--:--' },
    ...(activeWeeks != null ? [{ label: 'Semanas ativas', value: `${activeWeeks}/8` }] : []),
  ];

  return (
    <View className="mx-5 bg-surface-card rounded-[20px] flex-row py-5">
      {items.map((item, i) => (
        <View
          key={item.label}
          className={`flex-1 items-center ${i > 0 ? 'border-l border-surface-border' : ''}`}
        >
          <Text
            className="text-text-primary text-lg font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {item.value}
          </Text>
          <Text
            className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
            style={{ letterSpacing: 0.8 }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function WeeklyChart({
  weeklyStats,
}: {
  weeklyStats: { weekStart: string; totalDistanceM: number }[];
}) {
  const maxWeekDistance = Math.max(...weeklyStats.map((w) => w.totalDistanceM), 1);
  const periodTotalM = weeklyStats.reduce((acc, w) => acc + w.totalDistanceM, 0);
  const bestIdx = weeklyStats.reduce(
    (best, w, i) => (w.totalDistanceM > weeklyStats[best].totalDistanceM ? i : best),
    0,
  );

  return (
    <View className="bg-surface-card rounded-[20px] p-5">
      <View className="flex-row items-end h-24 gap-1.5">
        {weeklyStats.map((w, i) => {
          const pct = (w.totalDistanceM / maxWeekDistance) * 100;
          const isBest = i === bestIdx && w.totalDistanceM > 0;
          return (
            <View key={w.weekStart} className="flex-1 justify-end h-full">
              <View
                className={`rounded-full w-full ${isBest ? 'bg-brand-primary' : w.totalDistanceM > 0 ? 'bg-surface-elevated' : ''}`}
                style={{
                  height: `${Math.max(pct, 5)}%`,
                  backgroundColor: w.totalDistanceM === 0 ? '#17171B' : undefined,
                }}
              />
            </View>
          );
        })}
      </View>

      <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-surface-border">
        <View>
          <Text
            className="text-text-primary text-base font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatDistance(periodTotalM)}
          </Text>
          <Text className="text-text-secondary text-[11px] mt-0.5">nas últimas 8 semanas</Text>
        </View>
        {weeklyStats[bestIdx].totalDistanceM > 0 && (
          <View className="items-end">
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <Text
                className="text-text-primary text-base font-extrabold"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatDistance(weeklyStats[bestIdx].totalDistanceM)}
              </Text>
            </View>
            <Text className="text-text-secondary text-[11px] mt-0.5">melhor semana</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function AchievementTile({
  name,
  icon,
  unlocked,
}: {
  name: string;
  icon: IoniconsName;
  unlocked: boolean;
}) {
  return (
    <View
      className={`bg-surface-card rounded-[20px] items-center justify-center ${unlocked ? '' : 'opacity-60'}`}
      style={{ aspectRatio: 1, gap: 8 }}
    >
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${
          unlocked ? 'bg-surface-elevated' : ''
        }`}
        style={unlocked ? undefined : { backgroundColor: '#17171B' }}
      >
        <Ionicons
          name={unlocked ? icon : 'lock-closed'}
          size={unlocked ? 20 : 16}
          color={unlocked ? colors.brand.primary : colors.text.disabled}
        />
      </View>
      <Text
        className={`text-xs font-semibold text-center ${unlocked ? 'text-text-primary' : 'text-text-disabled'}`}
        numberOfLines={2}
        style={{ paddingHorizontal: 8 }}
      >
        {name}
      </Text>
    </View>
  );
}

/* ---------------------------------- screen --------------------------------- */

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

  const activeWeeks = weeklyStats
    ? weeklyStats.filter((w) => w.totalDistanceM > 0).length
    : null;
  const unlockedSlugs = new Set((achievements ?? []).map((a) => a.slug));
  const unlockedCount = ACHIEVEMENT_CATALOG.filter((c) => unlockedSlugs.has(c.slug)).length;

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Top bar */}
      <View className="flex-row items-center justify-end px-5 pt-14 pb-5">
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
        <IdentityHeader
          name={profile.name}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          createdAt={profile.createdAt}
        />

        <Odometer totalDistanceM={profile.totalDistanceM} />

        <StatStrip
          totalRuns={profile.totalRuns}
          bestPaceSkm={profile.bestPaceSkm}
          activeWeeks={activeWeeks}
        />

        {/* Weekly rhythm */}
        {weeklyStats && weeklyStats.length > 0 && (
          <View className="mx-5 mt-7">
            <SectionLabel label="Ritmo semanal" />
            <WeeklyChart weeklyStats={weeklyStats} />
          </View>
        )}

        {/* Achievements — full catalog, locked ones as goals */}
        <View className="mx-5 mt-7">
          <SectionLabel
            label={`Conquistas · ${unlockedCount} de ${ACHIEVEMENT_CATALOG.length}`}
            action="Ver todas"
            onAction={() => router.push('/(tabs)/profile/achievements' as any)}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
            {ACHIEVEMENT_CATALOG.map((item) => (
              <View key={item.slug} style={{ width: '25%', padding: 4 }}>
                <AchievementTile
                  name={item.name}
                  icon={item.icon}
                  unlocked={unlockedSlugs.has(item.slug)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <AdBanner />
    </View>
  );
}
