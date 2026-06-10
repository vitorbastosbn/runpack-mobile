import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '@store/session.store';
import { useAuthStore } from '@store/auth.store';
import { useLiveSession } from '@features/sessions/hooks/useLiveSession';
import { useTelemetry } from '@features/sessions/hooks/useTelemetry';
import { useFinishSession, useLeaveSession } from '@features/sessions/hooks/useSessionActions';
import { Avatar } from '@shared/components/Avatar';
import { confirmAction } from '@shared/components/AppDialogs';
import type { RankingEntry } from '@features/sessions/types';

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatPace(paceSKm: number): string {
  if (paceSKm <= 0) return '--:--';
  const m = Math.floor(paceSKm / 60);
  const s = Math.floor(paceSKm % 60).toString().padStart(2, '0');
  return `${m}:${s}/km`;
}

function formatDistance(m: number): string {
  return (m / 1000).toFixed(2) + 'km';
}

function GoalProgressBar({ distanceM, goalM }: { distanceM: number; goalM: number }) {
  const pct = Math.min(1, goalM > 0 ? distanceM / goalM : 0);
  return (
    <View className="mx-5 mb-6">
      <View className="h-1 bg-surface-elevated rounded-full overflow-hidden">
        <View className="h-full bg-brand-primary rounded-full" style={{ width: `${pct * 100}%` }} />
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-text-secondary text-xs">Meta {formatDistance(goalM)}</Text>
        <Text
          className="text-text-secondary text-xs font-semibold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {Math.round(pct * 100)}%
        </Text>
      </View>
    </View>
  );
}

export default function LiveSessionScreen() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const wsStatus = useSessionStore((s) => s.status);
  const ranking = useSessionStore((s) => s.ranking);
  const joinedAt = useSessionStore((s) => s.joinedAt);
  const distanceM = useSessionStore((s) => s.distanceM);
  const paceSKm = useSessionStore((s) => s.paceSKm);
  const isCreator = useSessionStore((s) => s.isCreator);
  const groupName = useSessionStore((s) => s.groupName);
  const distanceGoalM = useSessionStore((s) => s.distanceGoalM);
  const goalCompleted = useSessionStore((s) => s.goalCompleted);
  const userId = useAuthStore((s) => s.user?.id);

  // 1s local tick for smooth timer — independent of 5s telemetry interval
  const [liveElapsedMs, setLiveElapsedMs] = useState(0);
  useEffect(() => {
    if (!joinedAt) return;
    // Stop ticking once goal completed — freeze time at completion moment
    if (goalCompleted) return;
    const tick = setInterval(() => {
      setLiveElapsedMs(Math.max(0, Date.now() - joinedAt));
    }, 1000);
    return () => clearInterval(tick);
  }, [joinedAt, goalCompleted]);

  const { sendTelemetry, reconnect, toasts } = useLiveSession();
  useTelemetry(sendTelemetry);

  const finishSession = useFinishSession();
  const leaveSession = useLeaveSession();

  const handleEnd = async () => {
    const ok = await confirmAction({
      title: isCreator ? 'Encerrar para todos' : 'Sair da corrida',
      message: isCreator
        ? 'Todos serão removidos da corrida.'
        : 'Você sairá da corrida mas ela continuará para os outros.',
      confirmLabel: isCreator ? 'Encerrar corrida' : 'Sair da corrida',
      destructive: true,
    });
    if (!ok || !sessionId || !userId) return;

    const finalElapsedMs = joinedAt ? Math.max(0, Date.now() - joinedAt) : 0;
    const finalPaceSkm = distanceM > 0
      ? (finalElapsedMs / 1000) / (distanceM / 1000)
      : 0;
    sendTelemetry({ sessionId, userId, elapsedMs: finalElapsedMs, distanceM, paceSKm: finalPaceSkm });

    if (isCreator) {
      await finishSession.mutateAsync({ sessionId, elapsedMs: finalElapsedMs, distanceM, paceSKm: finalPaceSkm });
    } else {
      await leaveSession.mutateAsync(sessionId);
    }
    router.replace('/(modal)/run-summary');
  };

  const renderRankEntry = useCallback(({ item }: { item: RankingEntry }) => {
    const isMe = item.userId === userId;
    return (
      <View
        className={`flex-row items-center px-4 py-3 mb-2 rounded-2xl ${
          isMe ? 'bg-surface-elevated' : 'bg-surface-card'
        }`}
      >
        <Text
          className={`w-7 text-sm font-extrabold ${isMe ? 'text-brand-primary' : 'text-text-disabled'}`}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {item.rank}
        </Text>
        <View className="mr-3">
          <Avatar name={item.username} avatarUrl={item.avatarUrl} size={34} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-sm">
            {item.username}{isMe ? ' (você)' : ''}
          </Text>
          <Text className="text-text-secondary text-xs mt-0.5">{formatPace(item.paceSKm)}</Text>
        </View>
        <Text
          className="text-text-primary font-extrabold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatDistance(item.distanceM)}
        </Text>
      </View>
    );
  }, [userId]);

  if (!sessionId) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <Text className="text-text-secondary">Nenhuma sessão ativa</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Connection status banner */}
      {wsStatus === 'reconnecting' && (
        <View className="bg-status-warning px-4 py-2 items-center">
          <Text className="text-black font-semibold text-xs">Reconectando...</Text>
        </View>
      )}
      {wsStatus === 'error' && (
        <View className="bg-status-error px-4 py-2 flex-row items-center justify-between">
          <Text className="text-white font-semibold text-xs">Sem conexão</Text>
          <TouchableOpacity onPress={reconnect}>
            <Text className="text-white text-xs underline">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Goal completed banner */}
      {goalCompleted && (
        <View className="bg-brand-primary px-4 py-3 flex-row items-center justify-center gap-2">
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text className="text-white font-bold text-sm">Meta concluída! Aguardando demais...</Text>
        </View>
      )}

      {/* Header */}
      <View className="px-5 pt-14 pb-2 flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <Text
              className="text-status-success text-[10px] font-bold uppercase"
              style={{ letterSpacing: 1.4 }}
            >
              Ao vivo
            </Text>
          </View>
          <Text className="text-text-primary text-lg font-extrabold tracking-tight mt-0.5">
            {groupName ?? 'Corrida livre'}
          </Text>
        </View>
      </View>

      {/* Hero metric — distance */}
      <View className="items-center pt-4 pb-2">
        <Text
          className="text-text-primary font-extrabold"
          style={{ fontSize: 76, lineHeight: 80, letterSpacing: -3, fontVariant: ['tabular-nums'] }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {(distanceM / 1000).toFixed(2)}
        </Text>
        <Text
          className="text-text-secondary text-[11px] font-semibold uppercase -mt-1"
          style={{ letterSpacing: 2 }}
        >
          Quilômetros
        </Text>
      </View>

      {/* Secondary metrics */}
      <View className="flex-row justify-center gap-12 pt-5 pb-6">
        <View className="items-center">
          <Text
            className="text-text-primary text-2xl font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatTime(liveElapsedMs)}
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
            className="text-text-primary text-2xl font-extrabold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatPace(paceSKm)}
          </Text>
          <Text
            className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
            style={{ letterSpacing: 1 }}
          >
            Pace
          </Text>
        </View>
      </View>

      {/* Distance goal progress bar */}
      {distanceGoalM != null && distanceGoalM > 0 && (
        <GoalProgressBar distanceM={distanceM} goalM={distanceGoalM} />
      )}

      {/* Ranking */}
      <Text
        className="text-text-secondary text-[11px] font-semibold uppercase px-5 mb-3"
        style={{ letterSpacing: 1.4 }}
      >
        Ranking ao vivo
      </Text>
      <FlatList
        data={ranking}
        keyExtractor={(item) => item.userId}
        renderItem={renderRankEntry}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        ListEmptyComponent={
          <Text className="text-text-secondary text-sm text-center mt-4">
            Aguardando dados de corrida...
          </Text>
        }
      />

      {/* Toasts */}
      {toasts.length > 0 && (
        <View className="absolute top-28 left-0 right-0 items-center px-4">
          {toasts.slice(-1).map((msg, i) => (
            <View key={i} className="bg-surface-elevated rounded-full px-5 py-2.5">
              <Text className="text-text-primary text-sm">{msg}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bottom actions */}
      <View className="px-5 pb-8 pt-4">
        <TouchableOpacity
          className="w-full bg-surface-card rounded-2xl py-4 items-center"
          onPress={handleEnd}
          activeOpacity={0.85}
        >
          <Text className="text-status-error font-bold">
            {isCreator ? 'Encerrar corrida' : 'Sair da corrida'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
