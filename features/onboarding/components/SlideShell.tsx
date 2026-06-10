import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

/** Props que todo slide do tour recebe do pager. */
export interface SlideProps {
  scrollX: SharedValue<number>;
  index: number;
  pageWidth: number;
}

interface SlideShellProps extends SlideProps {
  kicker: string;
  title: ReactNode;
  body: string;
  /** Mockup visual do slide — recebe parallax conforme o scroll. */
  children: ReactNode;
}

/** Layout padrão dos slides de feature: visual com parallax + bloco de texto. */
export function SlideShell({ scrollX, index, pageWidth, kicker, title, body, children }: SlideShellProps) {
  const visualStyle = useAnimatedStyle(() => {
    const page = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];
    return {
      transform: [
        { translateX: interpolate(scrollX.value, page, [pageWidth * 0.3, 0, -pageWidth * 0.3]) },
      ],
      opacity: interpolate(
        scrollX.value,
        [(index - 0.65) * pageWidth, index * pageWidth, (index + 0.65) * pageWidth],
        [0, 1, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View className="flex-1 px-8">
      <Animated.View style={[{ flex: 1, justifyContent: 'center' }, visualStyle]}>
        {children}
      </Animated.View>

      <View className="pb-4">
        <Text
          className="text-brand-primary text-[12px] font-bold uppercase"
          style={{ letterSpacing: 3 }}
        >
          {kicker}
        </Text>
        <Text className="text-text-primary text-[30px] font-extrabold tracking-tight leading-[36px] mt-2">
          {title}
        </Text>
        <Text className="text-text-secondary text-[15px] leading-[22px] mt-3">{body}</Text>
      </View>
    </View>
  );
}
