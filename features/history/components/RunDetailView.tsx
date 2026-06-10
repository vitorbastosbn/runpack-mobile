import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShareRunCard } from '@features/history/components/ShareRunCard';
import { useRunDetail } from '@features/history/hooks/useRunDetail';
import { useRunResultShare } from '@features/history/hooks/useRunResultShare';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { SectionLabel } from '@shared/components/SectionLabel';
import { Button } from '@shared/components/Button';
import { colors } from '@constants/theme';
import type { RunParticipantResult } from '@features/history/types';
import { formatDistance, formatDuration, formatPace, formatRank } from '@shared/utils/format';

function ParticipantRow({ p, isMe, isLast }: { p: RunParticipantResult; isMe: boolean; isLast: boolean }) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 ${isLast ? '' : 'border-b border-surface-border'} ${
        isMe ? 'bg-surface-elevated' : ''
      }`}
    >
      <Text className="text-text-secondary w-8 text-sm">{formatRank(p.finalRank)}</Text>
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${isMe ? 'text-brand-primary' : 'text-text-primary'}`}>
          {p.name}{isMe ? ' (você)' : ''}
        </Text>
        <Text className="text-text-disabled text-xs mt-0.5">@{p.username}</Text>
      </View>
      <View className="items-end">
        <Text
          className="text-text-primary text-sm font-extrabold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatDistance(p.totalDistanceM)}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">{formatDuration(p.totalTimeMs)}</Text>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center flex-1">
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

export function RunDetailView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useRunDetail(sessionId);
  const { cardRef, isSharing, shareRunResult } = useRunResultShare();

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-bg">
        <ScreenHeader title="Corrida" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-surface-bg">
        <ScreenHeader title="Corrida" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8 gap-5">
          <Text className="text-text-primary text-base text-center">Erro ao carregar corrida</Text>
          <Button label="Tentar novamente" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  if (!data.myResult) {
    return (
      <View className="flex-1 bg-surface-bg">
        <ScreenHeader title="Corrida" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-text-primary text-base text-center">Resultado não disponível</Text>
        </View>
      </View>
    );
  }

  const { myResult, participants } = data;
  const shareRun = {
    title: data.groupName ?? 'Corrida livre',
    startedAt: data.startedAt,
    myResult,
    participants,
  };

  const date = new Date(data.startedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const title = data.groupName ?? 'Corrida livre';

  return (
    <View className="flex-1 bg-surface-bg">
      <ShareRunCard ref={cardRef} run={shareRun} />
      <ScreenHeader title={title} subtitle={date} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* My result */}
        <View className="mx-5 mt-2 mb-7">
          <View className="bg-surface-card rounded-[20px] p-5">
            <View className="items-center mb-5">
              <Text className="text-4xl">{formatRank(myResult.finalRank)}</Text>
              <Text className="text-text-secondary text-xs mt-1.5">
                {myResult.finalRank}º de {participants.length} participante{participants.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Metric label="Distância" value={formatDistance(myResult.totalDistanceM)} />
              <Metric label="Tempo" value={formatDuration(myResult.totalTimeMs)} />
              <Metric label="Pace" value={formatPace(myResult.avgPaceSkm)} />
            </View>
          </View>
          <View className="mt-3">
            <Button
              label={isSharing ? 'Preparando imagem...' : 'Compartilhar resultado'}
              icon="share-social"
              variant="secondary"
              onPress={shareRunResult}
              disabled={isSharing}
            />
          </View>
        </View>

        {/* Ranking */}
        <View className="mx-5">
          <SectionLabel label="Ranking" />
          <View className="bg-surface-card rounded-[20px] overflow-hidden">
            {participants.map((p, i) => (
              <ParticipantRow
                key={p.userId}
                p={p}
                isMe={p.userId === myResult.userId}
                isLast={i === participants.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
