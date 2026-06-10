import { useRef, useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { Button } from '@shared/components/Button';
import { SlideHero } from './SlideHero';
import { SlideLiveRace } from './SlideLiveRace';
import { SlidePacks } from './SlidePacks';
import { SlideProgress } from './SlideProgress';

const SLIDES = [SlideHero, SlideLiveRace, SlidePacks, SlideProgress] as const;
const TRACK_GAP = 6;
const SCREEN_PADDING_X = 32;

interface SegmentProps {
  scrollX: SharedValue<number>;
  index: number;
  segmentWidth: number;
  pageWidth: number;
}

/** Segmento da barra de progresso — preenche conforme o scroll chega no slide. */
function Segment({ scrollX, index, segmentWidth, pageWidth }: SegmentProps) {
  const fill = useAnimatedStyle(() => ({
    width: interpolate(
      scrollX.value,
      [(index - 1) * pageWidth, index * pageWidth],
      [0, segmentWidth],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View
      className="h-1 rounded-full bg-surface-elevated overflow-hidden"
      style={{ width: segmentWidth }}
    >
      <Animated.View className="h-1 rounded-full bg-brand-primary" style={fill} />
    </View>
  );
}

export function OnboardingTour() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [page, setPage] = useState(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const segmentWidth =
    (width - SCREEN_PADDING_X * 2 - TRACK_GAP * (SLIDES.length - 1)) / SLIDES.length;
  const isLastPage = page === SLIDES.length - 1;

  const goToPermissions = () => router.push('/(onboarding)/permissions');

  const handleNext = () => {
    if (isLastPage) {
      goToPermissions();
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  return (
    <View className="flex-1 bg-surface-bg pt-16 pb-12">
      <View className="flex-row items-center justify-between px-8 pb-2">
        <Text
          className="text-text-secondary text-[12px] font-semibold uppercase"
          style={{ letterSpacing: 3 }}
        >
          RunPack
        </Text>
        <Pressable onPress={goToPermissions} hitSlop={12} accessibilityRole="button">
          <Text className="text-text-secondary text-[13px] font-semibold">Pular</Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {SLIDES.map((Slide, i) => (
          <View key={i} style={{ width }}>
            <Slide scrollX={scrollX} index={i} pageWidth={width} />
          </View>
        ))}
      </Animated.ScrollView>

      <View className="px-8 gap-6 pt-2">
        <View className="flex-row" style={{ gap: TRACK_GAP }}>
          {SLIDES.map((_, i) => (
            <Segment
              key={i}
              scrollX={scrollX}
              index={i}
              segmentWidth={segmentWidth}
              pageWidth={width}
            />
          ))}
        </View>
        <Button label={isLastPage ? 'Vamos nessa' : 'Continuar'} onPress={handleNext} />
      </View>
    </View>
  );
}
