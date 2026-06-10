import { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '@store/session.store';
import { useSessionAchievements } from '@features/achievements/hooks/useSessionAchievements';
import { useRunDetail } from '@features/history/hooks/useRunDetail';
import { ShareRunCard } from '@features/history/components/ShareRunCard';
import { useRunResultShare } from '@features/history/hooks/useRunResultShare';
import { SectionLabel } from '@shared/components/SectionLabel';
import { Button, ButtonStack } from '@shared/components/Button';
import { colors } from '@constants/theme';
import type { ShareRunCardInput } from '@features/history/utils/shareRunResult';

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

function RankRow({ rank, username, distanceKm }: { rank: number; username: string; distanceKm: string }) {
  return (
    <View className="flex-row items-center px-4 py-3 mb-2 bg-surface-card rounded-2xl">
      <Text
        className="text-text-disabled w-7 text-sm font-extrabold"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {rank}
      </Text>
      <View className="flex-1 ml-1">
        <Text className="text-text-primary font-semibold text-sm">{username}</Text>
      </View>
      <Text className="text-text-primary font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>
        {distanceKm}km
      </Text>
    </View>
  );
}

export default function RunSummaryScreen() {
  const router = useRouter();
  const { sessionId, elapsedMs, distanceM, paceSKm, ranking, groupName, clearSession } = useSessionStore();
  const { cardRef, isSharing, shareRunResult } = useRunResultShare();

  // Poll once after 2s delay so async achievement evaluation has time to complete
  const { data: achievements } = useSessionAchievements(sessionId ?? '', !!sessionId);
  const { data: runDetail } = useRunDetail(sessionId ?? '');
  const finalRanking = runDetail?.participants ?? [];
  const shareRun = useMemo<ShareRunCardInput | null>(() => {
    if (runDetail?.myResult) {
      return {
        title: runDetail.groupName ?? 'Corrida livre',
        startedAt: runDetail.startedAt,
        myResult: runDetail.myResult,
        participants: runDetail.participants,
      };
    }

    if (!sessionId) return null;

    return {
      title: groupName ?? 'Corrida livre',
      myResult: {
        userId: 'me',
        name: 'Você',
        username: 'voce',
        totalDistanceM: distanceM,
        totalTimeMs: elapsedMs,
        avgPaceSkm: paceSKm,
        finalRank: ranking.find((entry) => entry.distanceM === distanceM)?.rank ?? 1,
      },
      participants: ranking.map((entry) => ({
        userId: entry.userId,
        name: entry.username,
        username: entry.username,
        totalDistanceM: entry.distanceM,
        totalTimeMs: entry.elapsedMs,
        avgPaceSkm: entry.paceSKm,
        finalRank: entry.rank,
      })),
    };
  }, [distanceM, elapsedMs, groupName, paceSKm, ranking, runDetail, sessionId]);

  return (
    <View className="flex-1 bg-surface-bg">
      {shareRun ? <ShareRunCard ref={cardRef} run={shareRun} /> : null}
      <ScrollView className="flex-1 bg-surface-bg" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Celebration header */}
        <View className="px-6 pt-20 pb-6 items-center">
          <View className="w-16 h-16 rounded-full bg-brand-primary items-center justify-center mb-5">
            <Ionicons name="flag" size={26} color="#fff" />
          </View>
          <Text className="text-text-primary text-[26px] font-extrabold tracking-tight">
            Corrida finalizada!
          </Text>
          {groupName && <Text className="text-text-secondary text-sm mt-1">{groupName}</Text>}
        </View>

        {/* Hero metric */}
        <View className="items-center pb-2">
          <Text
            className="text-text-primary font-extrabold"
            style={{ fontSize: 60, lineHeight: 64, letterSpacing: -2, fontVariant: ['tabular-nums'] }}
          >
            {(distanceM / 1000).toFixed(2)}
          </Text>
          <Text
            className="text-text-secondary text-[11px] font-semibold uppercase"
            style={{ letterSpacing: 2 }}
          >
            Quilômetros
          </Text>
        </View>

        {/* Secondary metrics */}
        <View className="flex-row justify-center gap-12 pt-5 pb-8">
          <View className="items-center">
            <Text
              className="text-text-primary text-xl font-extrabold"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatTime(elapsedMs)}
            </Text>
            <Text
              className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
              style={{ letterSpacing: 1 }}
            >
              Tempo
            </Text>
          </View>
          <View className="items-center">
            <Text
              className="text-text-primary text-xl font-extrabold"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatPace(paceSKm)}
            </Text>
            <Text
              className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
              style={{ letterSpacing: 1 }}
            >
              Pace médio
            </Text>
          </View>
        </View>

        {(finalRanking.length > 0 || ranking.length > 0) && (
          <View className="mx-5 mb-7">
            <SectionLabel label="Resultado final" />
            {finalRanking.length > 0
              ? finalRanking.map((entry) => (
                  <RankRow
                    key={entry.userId}
                    rank={entry.finalRank}
                    username={entry.username}
                    distanceKm={(entry.totalDistanceM / 1000).toFixed(2)}
                  />
                ))
              : ranking.map((entry) => (
                  <RankRow
                    key={entry.userId}
                    rank={entry.rank}
                    username={entry.username}
                    distanceKm={(entry.distanceM / 1000).toFixed(2)}
                  />
                ))}
          </View>
        )}

        {achievements && achievements.length > 0 && (
          <View className="mx-5 mb-7">
            <SectionLabel label="Conquistas desbloqueadas" />
            {achievements.map((a) => (
              <View
                key={a.id}
                className="flex-row items-center bg-surface-card rounded-2xl px-4 py-3.5 mb-2 gap-3"
              >
                <Text className="text-2xl">{ACHIEVEMENT_ICONS[a.slug] ?? '🏅'}</Text>
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold text-sm">{a.name}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">{a.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="mx-5">
          <ButtonStack>
            {shareRun ? (
              <Button
                label={isSharing ? 'Preparando imagem...' : 'Compartilhar resultado'}
                icon="share-social"
                variant="secondary"
                onPress={shareRunResult}
                disabled={isSharing}
              />
            ) : null}
            <Button
              label="Ir para o início"
              onPress={() => { clearSession(); router.replace('/(tabs)/home'); }}
            />
          </ButtonStack>
        </View>
      </ScrollView>
    </View>
  );
}
