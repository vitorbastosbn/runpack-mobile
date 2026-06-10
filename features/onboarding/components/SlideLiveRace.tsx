import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, numeric } from '@constants/theme';
import { SlideShell, type SlideProps } from './SlideShell';

const ROW_H = 62;
const TICK_MS = 600;

interface Runner {
  id: string;
  name: string;
  initial: string;
  /** Metros ganhos por tick — demo acelerada da corrida. */
  speed: number;
  isYou?: boolean;
}

const RUNNERS: Runner[] = [
  { id: 'marina', name: 'Marina', initial: 'M', speed: 7.5 },
  { id: 'voce', name: 'Você', initial: 'V', speed: 11.5, isYou: true },
  { id: 'pedro', name: 'Pedro', initial: 'P', speed: 6.2 },
];

const INITIAL_DISTANCES: Record<string, number> = { marina: 1240, voce: 1150, pedro: 1185 };

const formatKm = (m: number) => `${(m / 1000).toFixed(2).replace('.', ',')} km`;

const formatClock = (totalSeconds: number) => {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
};

function LiveDot() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }),
      -1,
    );
  }, [pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value,
    transform: [{ scale: 1 + pulse.value * 1.8 }],
  }));

  return (
    <View style={{ width: 8, height: 8 }}>
      <Animated.View
        style={[
          { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.success },
          halo,
        ]}
      />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.success }} />
    </View>
  );
}

interface RankRowProps {
  runner: Runner;
  distance: number;
  rank: number;
  leaderDistance: number;
}

function RankRow({ runner, distance, rank, leaderDistance }: RankRowProps) {
  const rowStyle = useAnimatedStyle(
    () => ({
      top: withTiming(rank * ROW_H, { duration: 450, easing: Easing.out(Easing.cubic) }),
    }),
    [rank],
  );

  const barPct = Math.min(100, (distance / leaderDistance) * 100);

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, right: 0, height: ROW_H, justifyContent: 'center' },
        rowStyle,
      ]}
    >
      <View
        className={`flex-row items-center gap-3 rounded-2xl px-3 py-2.5 ${
          runner.isYou ? 'bg-brand-primary/10' : ''
        }`}
      >
        <Text
          className={runner.isYou ? 'text-brand-primary' : 'text-text-disabled'}
          style={{ ...numeric, fontSize: 18, width: 20, textAlign: 'center' }}
        >
          {rank + 1}
        </Text>
        <View
          className={`w-9 h-9 rounded-full items-center justify-center ${
            runner.isYou ? 'bg-brand-primary' : 'bg-surface-elevated'
          }`}
        >
          <Text className="text-white text-[13px] font-bold">{runner.initial}</Text>
        </View>
        <View className="flex-1">
          <Text
            className={`text-[14px] font-bold ${
              runner.isYou ? 'text-brand-primary' : 'text-text-primary'
            }`}
          >
            {runner.name}
          </Text>
          <View className="h-[3px] rounded-full bg-surface-elevated mt-1.5 overflow-hidden">
            <View
              className={`h-[3px] rounded-full ${
                runner.isYou ? 'bg-brand-primary' : 'bg-text-disabled'
              }`}
              style={{ width: `${barPct}%` }}
            />
          </View>
        </View>
        <Text className="text-text-primary" style={{ ...numeric, fontSize: 14 }}>
          {formatKm(distance)}
        </Text>
      </View>
    </Animated.View>
  );
}

export function SlideLiveRace(props: SlideProps) {
  const [distances, setDistances] = useState(INITIAL_DISTANCES);
  const [seconds, setSeconds] = useState(743);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
      setDistances((prev) => {
        // Reinicia a demo quando "Você" abre vantagem — overtake em loop.
        if (prev.voce - prev.marina > 260) return INITIAL_DISTANCES;
        const next: Record<string, number> = { ...prev };
        for (const runner of RUNNERS) {
          next[runner.id] = prev[runner.id] + runner.speed * (0.85 + Math.random() * 0.3);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const order = [...RUNNERS].sort((a, b) => distances[b.id] - distances[a.id]);
  const leaderDistance = distances[order[0].id];

  return (
    <SlideShell
      {...props}
      kicker="Ranking ao vivo"
      title={
        <>
          Quem corre mais, <Text className="text-brand-primary">lidera</Text>.
        </>
      }
      body="Comece uma corrida em segundos. Seu pack entra, e a distância de cada um disputa o topo em tempo real."
    >
      <View className="bg-surface-card rounded-3xl p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <LiveDot />
            <Text
              className="text-status-success text-[12px] font-bold uppercase"
              style={{ letterSpacing: 2 }}
            >
              Ao vivo
            </Text>
          </View>
          <Text className="text-text-secondary" style={{ ...numeric, fontSize: 14 }}>
            {formatClock(seconds)}
          </Text>
        </View>

        <View style={{ height: ROW_H * RUNNERS.length, marginTop: 14 }}>
          {RUNNERS.map((runner) => (
            <RankRow
              key={runner.id}
              runner={runner}
              distance={distances[runner.id]}
              rank={order.findIndex((r) => r.id === runner.id)}
              leaderDistance={leaderDistance}
            />
          ))}
        </View>

        <View className="border-t border-surface-border mt-2 pt-3">
          <Text className="text-text-disabled text-[12px]">
            Empatou na distância? Menor tempo vence.
          </Text>
        </View>
      </View>
    </SlideShell>
  );
}
