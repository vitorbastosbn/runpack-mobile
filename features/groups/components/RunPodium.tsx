import { View, Text } from 'react-native';
import { Avatar } from '@shared/components/Avatar';
import { formatDistance } from '@shared/utils/format';
import type { PodiumEntry } from '../types';

const RANK_COLOR: Record<number, { bg: string; fg: string }> = {
  1: { bg: '#FBBF24', fg: '#000' },
  2: { bg: '#9CA3AF', fg: '#000' },
  3: { bg: '#B45309', fg: '#FFF' },
};

function PodiumRow({ entry }: { entry: PodiumEntry }) {
  const c = RANK_COLOR[entry.finalRank] ?? { bg: '#52525B', fg: '#FFF' };
  return (
    <View className="flex-row items-center py-1.5">
      <View
        style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.bg }}
        className="items-center justify-center"
      >
        <Text style={{ color: c.fg, fontSize: 12, fontWeight: '800' }}>{entry.finalRank}</Text>
      </View>
      <View className="ml-4">
        <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={26} />
      </View>
      <Text className="text-text-primary text-sm ml-3 flex-1" numberOfLines={1}>
        {entry.username}
      </Text>
      <Text className="text-text-primary text-sm font-bold">
        {formatDistance(entry.totalDistanceM)}
      </Text>
    </View>
  );
}

export function RunPodium({ podium }: { podium: PodiumEntry[] }) {
  return (
    <View>
      {podium.map((entry) => (
        <PodiumRow key={entry.userId} entry={entry} />
      ))}
    </View>
  );
}
