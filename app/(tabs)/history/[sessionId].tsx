import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRunDetail } from '@features/history/hooks/useRunDetail';
import type { RunParticipantResult } from '@features/history/types';
import { formatDistance, formatDuration, formatPace, formatRank } from '@shared/utils/format';

function ParticipantRow({ p, isMe }: { p: RunParticipantResult; isMe: boolean }) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 border-b border-surface-border ${
        isMe ? 'bg-surface-elevated' : ''
      }`}
    >
      <Text className="text-text-secondary w-8 text-sm">{formatRank(p.finalRank)}</Text>
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${isMe ? 'text-brand-primary' : 'text-text-primary'}`}
        >
          {p.name}{isMe ? ' (você)' : ''}
        </Text>
        <Text className="text-text-disabled text-xs">@{p.username}</Text>
      </View>
      <View className="items-end">
        <Text className="text-text-primary text-sm font-bold">{formatDistance(p.totalDistanceM)}</Text>
        <Text className="text-text-secondary text-xs">{formatDuration(p.totalTimeMs)}</Text>
      </View>
    </View>
  );
}

export default function RunDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, isLoading, isError, refetch } = useRunDetail(sessionId);

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Text className="text-text-primary text-base text-center mb-4">Erro ao carregar corrida</Text>
        <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-xl" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { myResult, participants } = data;

  return (
    <ScrollView className="flex-1 bg-surface-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-4 pt-4 pb-2">
        {data.groupName && (
          <Text className="text-brand-primary text-xs font-medium mb-1">{data.groupName}</Text>
        )}
        <Text className="text-text-secondary text-xs">
          {new Date(data.startedAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        </Text>
      </View>

      <View className="mx-4 bg-surface-card rounded-xl p-4 mb-6">
        <Text className="text-text-secondary text-xs mb-3">Seus resultados</Text>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-text-primary text-2xl font-bold">
              {formatDistance(myResult.totalDistanceM)}
            </Text>
            <Text className="text-text-secondary text-xs">distância</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-text-primary text-2xl font-bold">
              {formatDuration(myResult.totalTimeMs)}
            </Text>
            <Text className="text-text-secondary text-xs">tempo</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-text-primary text-2xl font-bold">
              {formatPace(myResult.avgPaceSkm)}
            </Text>
            <Text className="text-text-secondary text-xs">pace</Text>
          </View>
        </View>
        <View className="mt-4 items-center">
          <Text className="text-4xl">{formatRank(myResult.finalRank)}</Text>
          <Text className="text-text-secondary text-xs mt-1">
            {myResult.finalRank}º de {participants.length} participante{participants.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <Text className="text-text-secondary text-xs px-4 mb-2">Ranking</Text>
      <View className="bg-surface-card rounded-xl mx-4 overflow-hidden">
        {participants.map((p) => (
          <ParticipantRow key={p.userId} p={p} isMe={p.userId === myResult.userId} />
        ))}
      </View>
    </ScrollView>
  );
}
