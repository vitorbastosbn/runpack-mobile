import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '@store/session.store';
import { useAuthStore } from '@store/auth.store';
import { useLiveSession } from '@features/sessions/hooks/useLiveSession';
import { useTelemetry } from '@features/sessions/hooks/useTelemetry';
import { useReactions, AVAILABLE_EMOJIS } from '@features/sessions/hooks/useReactions';
import { useFinishSession, useLeaveSession } from '@features/sessions/hooks/useSessionActions';
import { Avatar } from '@shared/components/Avatar';
import type { RankingEntry } from '@features/sessions/types';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
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

export default function LiveSessionScreen() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const wsStatus = useSessionStore((s) => s.status);
  const ranking = useSessionStore((s) => s.ranking);
  const elapsedMs = useSessionStore((s) => s.elapsedMs);
  const distanceM = useSessionStore((s) => s.distanceM);
  const paceSKm = useSessionStore((s) => s.paceSKm);
  const isCreator = useSessionStore((s) => s.isCreator);
  const groupName = useSessionStore((s) => s.groupName);
  const clearSession = useSessionStore((s) => s.clearSession);
  const userId = useAuthStore((s) => s.user?.id);

  const { sendTelemetry, sendReaction, reconnect, reactions, toasts } = useLiveSession();
  useTelemetry(sendTelemetry);
  const { availableEmojis } = useReactions(sendReaction);

  const finishSession = useFinishSession();
  const leaveSession = useLeaveSession();

  const handleEnd = () => {
    const title = isCreator ? 'Encerrar para todos' : 'Sair da corrida';
    const message = isCreator
      ? 'Todos serão removidos da corrida.'
      : 'Você sairá da corrida mas ela continuará para os outros.';
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: 'destructive',
        onPress: async () => {
          if (!sessionId) return;
          if (isCreator) {
            await finishSession.mutateAsync(sessionId);
          } else {
            await leaveSession.mutateAsync(sessionId);
          }
          clearSession();
          router.replace('/(modal)/run-summary');
        },
      },
    ]);
  };

  const renderRankEntry = useCallback(({ item }: { item: RankingEntry }) => {
    const isMe = item.userId === userId;
    return (
      <View
        className={`flex-row items-center px-4 py-3 mb-2 rounded-xl border ${
          isMe ? 'bg-brand-primary/10 border-brand-primary/40' : 'bg-surface-card border-surface-border'
        }`}
      >
        <Text className="text-text-secondary w-6 text-sm font-bold">#{item.rank}</Text>
        <View className="mx-3">
          <Avatar name={item.username} avatarUrl={item.avatarUrl} size={36} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-sm">
            {item.username}{isMe ? ' (você)' : ''}
          </Text>
          <Text className="text-text-secondary text-xs">{formatPace(item.paceSKm)}</Text>
        </View>
        <Text className="text-text-primary font-bold">{formatDistance(item.distanceM)}</Text>
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

      {/* Header */}
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-secondary text-xs uppercase tracking-wider">
          {groupName ?? 'Corrida livre'}
        </Text>
        <Text className="text-text-primary text-lg font-bold">Corrida ao vivo</Text>
      </View>

      {/* Personal metrics */}
      <View className="flex-row px-4 mb-6 gap-3">
        <View className="flex-1 bg-surface-card border border-surface-border rounded-xl p-4 items-center">
          <Text className="text-brand-primary text-3xl font-bold">{formatTime(elapsedMs)}</Text>
          <Text className="text-text-secondary text-xs mt-1">Tempo</Text>
        </View>
        <View className="flex-1 bg-surface-card border border-surface-border rounded-xl p-4 items-center">
          <Text className="text-text-primary text-3xl font-bold">{formatDistance(distanceM)}</Text>
          <Text className="text-text-secondary text-xs mt-1">Distância</Text>
        </View>
        <View className="flex-1 bg-surface-card border border-surface-border rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">{formatPace(paceSKm)}</Text>
          <Text className="text-text-secondary text-xs mt-1">Pace</Text>
        </View>
      </View>

      {/* Ranking */}
      <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider px-4 mb-2">
        Ranking ao vivo
      </Text>
      <FlatList
        data={ranking}
        keyExtractor={(item) => item.userId}
        renderItem={renderRankEntry}
        contentContainerStyle={{ paddingHorizontal: 16 }}
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
            <View key={i} className="bg-surface-card border border-surface-border rounded-xl px-4 py-2">
              <Text className="text-text-primary text-sm">{msg}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Floating reactions */}
      {reactions.map((r) => (
        <View key={r.id} className="absolute bottom-32 left-0 right-0 items-center">
          <Text style={{ fontSize: 40 }}>{r.emoji}</Text>
        </View>
      ))}

      {/* Bottom actions */}
      <View className="px-4 pb-8 pt-4 border-t border-surface-border">
        {/* Reaction buttons */}
        <View className="flex-row justify-center gap-4 mb-4">
          {AVAILABLE_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => sendReaction(emoji)}
              className="w-12 h-12 bg-surface-card border border-surface-border rounded-full items-center justify-center"
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* End/Leave button */}
        <TouchableOpacity
          className="w-full bg-status-error rounded-xl py-4 items-center"
          onPress={handleEnd}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold">
            {isCreator ? 'Encerrar corrida' : 'Sair da corrida'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
