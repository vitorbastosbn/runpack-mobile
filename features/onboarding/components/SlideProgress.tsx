import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { colors, numeric } from '@constants/theme';
import { SlideShell, type SlideProps } from './SlideShell';

const MAX_BAR_H = 96;

/** Alturas relativas das últimas 8 semanas — a última é a atual (destaque). */
const WEEKS = [0.32, 0.5, 0.42, 0.68, 0.55, 0.78, 0.62, 1] as const;

const BADGES = [
  { icon: 'rocket', label: '1ª corrida', unlocked: true },
  { icon: 'people', label: 'Em pack', unlocked: true },
  { icon: 'trophy', label: 'Pódio', unlocked: true },
  { icon: 'flash', label: "5k < 30'", unlocked: false },
] as const;

interface WeekBarProps {
  scrollX: SharedValue<number>;
  slideIndex: number;
  pageWidth: number;
  barIndex: number;
  height: number;
  isCurrent: boolean;
}

/** Barra que cresce conforme o slide entra na tela — animação guiada pelo scroll. */
function WeekBar({ scrollX, slideIndex, pageWidth, barIndex, height, isCurrent }: WeekBarProps) {
  const style = useAnimatedStyle(() => ({
    height: interpolate(
      scrollX.value,
      [(slideIndex - 0.9) * pageWidth + barIndex * 18, slideIndex * pageWidth],
      [8, height * MAX_BAR_H],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View className="flex-1 items-center justify-end" style={{ height: MAX_BAR_H }}>
      <Animated.View
        style={[
          {
            width: '100%',
            borderRadius: 6,
            backgroundColor: isCurrent ? colors.brand.primary : colors.surface.elevated,
          },
          style,
        ]}
      />
    </View>
  );
}

export function SlideProgress(props: SlideProps) {
  const { scrollX, index, pageWidth } = props;

  return (
    <SlideShell
      {...props}
      kicker="Sua evolução"
      title={
        <>
          Cada corrida <Text className="text-brand-primary">conta</Text>.
        </>
      }
      body="Histórico completo, evolução semana a semana e conquistas pra destravar — da primeira corrida ao pódio."
    >
      <View className="bg-surface-card rounded-3xl p-5">
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-text-primary" style={{ ...numeric, fontSize: 40, lineHeight: 44 }}>
              32,4 <Text style={{ fontSize: 18 }}>km</Text>
            </Text>
            <Text
              className="text-text-disabled text-[11px] font-bold uppercase mt-1"
              style={{ letterSpacing: 2 }}
            >
              este mês
            </Text>
          </View>
          <View className="bg-surface-elevated rounded-full px-3 py-1.5">
            <Text className="text-status-success text-[12px] font-bold">+18%</Text>
          </View>
        </View>

        <View className="flex-row items-end gap-2 mt-5">
          {WEEKS.map((height, i) => (
            <WeekBar
              key={i}
              scrollX={scrollX}
              slideIndex={index}
              pageWidth={pageWidth}
              barIndex={i}
              height={height}
              isCurrent={i === WEEKS.length - 1}
            />
          ))}
        </View>

        <View className="flex-row justify-between mt-5 pt-4 border-t border-surface-border">
          {BADGES.map((badge) => (
            <View key={badge.label} className="items-center gap-1.5" style={{ width: 64 }}>
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{
                  backgroundColor: badge.unlocked ? 'rgba(255,90,31,0.12)' : colors.surface.elevated,
                  borderWidth: 1,
                  borderColor: badge.unlocked ? colors.brand.primary : colors.surface.border,
                }}
              >
                <Ionicons
                  name={badge.icon}
                  size={17}
                  color={badge.unlocked ? colors.brand.primary : colors.text.disabled}
                />
              </View>
              <Text
                className={`text-[10px] font-semibold ${
                  badge.unlocked ? 'text-text-secondary' : 'text-text-disabled'
                }`}
                numberOfLines={1}
              >
                {badge.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SlideShell>
  );
}
