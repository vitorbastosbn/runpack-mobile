import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { numeric } from '@constants/theme';
import type { SlideProps } from './SlideShell';

const TICKER_ITEMS = ["5'12\" /km", '4,2 km', 'ao vivo', 'pack +6', '1º lugar', '12:48'];

/** Faixa de telemetria em loop infinito — duplicada para emendar sem corte. */
function TelemetryTicker() {
  const [setWidth, setSetWidth] = useState(0);
  const tx = useSharedValue(0);

  useEffect(() => {
    if (!setWidth) return;
    tx.value = 0;
    tx.value = withRepeat(
      withTiming(-setWidth, { duration: setWidth * 28, easing: Easing.linear }),
      -1,
    );
  }, [setWidth, tx]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const renderSet = (measure: boolean) => (
    <View
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onLayout={measure ? (e) => setSetWidth(e.nativeEvent.layout.width) : undefined}
    >
      {TICKER_ITEMS.map((item) => (
        <View key={item} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            className="text-text-disabled text-[12px] font-bold uppercase"
            style={{ letterSpacing: 2, ...numeric }}
          >
            {item}
          </Text>
          <Text className="text-brand-primary text-[12px] font-bold mx-4">/</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View
      className="border-y border-surface-border py-3 -mx-8"
      style={{ overflow: 'hidden', transform: [{ rotate: '-2deg' }] }}
    >
      <Animated.View style={[{ flexDirection: 'row' }, style]}>
        {renderSet(true)}
        {renderSet(false)}
      </Animated.View>
    </View>
  );
}

function PulseDot() {
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
        className="bg-brand-primary"
        style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4 }, halo]}
      />
      <View className="bg-brand-primary" style={{ width: 8, height: 8, borderRadius: 4 }} />
    </View>
  );
}

export function SlideHero({ scrollX, index, pageWidth }: SlideProps) {
  const [km, setKm] = useState(3.84);

  useEffect(() => {
    const id = setInterval(() => setKm((v) => v + 0.01), 160);
    return () => clearInterval(id);
  }, []);

  const visualStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          [index * pageWidth, (index + 1) * pageWidth],
          [0, -pageWidth * 0.35],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      scrollX.value,
      [index * pageWidth, (index + 0.65) * pageWidth],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View className="flex-1 px-8">
      <View className="pt-8">
        <Text className="text-text-primary text-[40px] font-extrabold tracking-tight leading-[46px]">
          Corra junto.{'\n'}Mesmo <Text className="text-brand-primary">longe</Text>.
        </Text>
        <Text className="text-text-secondary text-[15px] leading-[22px] mt-4">
          O RunPack transforma qualquer corrida numa disputa ao vivo com seus amigos — cada um
          onde estiver.
        </Text>
      </View>

      <Animated.View style={[{ flex: 1, justifyContent: 'center' }, visualStyle]}>
        <View className="items-center">
          <LinearGradient
            colors={['rgba(255,90,31,0.16)', 'rgba(255,90,31,0)']}
            style={{
              position: 'absolute',
              width: 280,
              height: 280,
              borderRadius: 140,
              alignSelf: 'center',
            }}
          />
          <View className="flex-row items-center gap-2">
            <PulseDot />
            <Text
              className="text-text-secondary text-[12px] font-bold uppercase"
              style={{ letterSpacing: 3 }}
            >
              Você, agora
            </Text>
          </View>
          <Text
            className="text-text-primary mt-1"
            style={{ ...numeric, fontSize: 84, lineHeight: 92, letterSpacing: -2 }}
          >
            {km.toFixed(2).replace('.', ',')}
          </Text>
          <Text
            className="text-text-disabled text-[13px] font-semibold uppercase"
            style={{ letterSpacing: 4 }}
          >
            quilômetros
          </Text>
        </View>
      </Animated.View>

      <View className="pb-6">
        <TelemetryTicker />
      </View>
    </View>
  );
}
