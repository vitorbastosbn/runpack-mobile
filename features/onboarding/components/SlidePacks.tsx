import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, numeric } from '@constants/theme';
import { SlideShell, type SlideProps } from './SlideShell';

const MEMBERS = ['A', 'L', 'R', 'C'] as const;

/** Notificação push que entra e sai em loop — o convite chegando. */
function FloatingNotification() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
        withDelay(2600, withTiming(0, { duration: 350, easing: Easing.in(Easing.cubic) })),
        withDelay(900, withTiming(0, { duration: 1 })),
      ),
      -1,
    );
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: colors.surface.elevated,
          borderRadius: 16,
          padding: 14,
        },
        style,
      ]}
    >
      <View className="w-8 h-8 rounded-lg bg-brand-primary items-center justify-center">
        <Ionicons name="flash" size={15} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text
          className="text-text-disabled text-[10px] font-bold uppercase"
          style={{ letterSpacing: 1.5 }}
        >
          RunPack · agora
        </Text>
        <Text className="text-text-primary text-[13px] leading-[18px] mt-0.5">
          Pedro começou uma corrida no Pack da Firma
        </Text>
      </View>
    </Animated.View>
  );
}

function MemberStack() {
  return (
    <View className="flex-row items-center">
      {MEMBERS.map((initial, i) => (
        <View
          key={initial}
          className="w-7 h-7 rounded-full bg-surface-elevated items-center justify-center"
          style={{
            marginLeft: i > 0 ? -9 : 0,
            zIndex: MEMBERS.length - i,
            borderWidth: 1.5,
            borderColor: colors.surface.card,
          }}
        >
          <Text className="text-white text-[11px] font-bold">{initial}</Text>
        </View>
      ))}
      <View
        className="w-7 h-7 rounded-full bg-surface-elevated items-center justify-center"
        style={{ marginLeft: -9, borderWidth: 1.5, borderColor: colors.surface.card }}
      >
        <Text className="text-white text-[10px] font-bold">+4</Text>
      </View>
    </View>
  );
}

export function SlidePacks(props: SlideProps) {
  return (
    <SlideShell
      {...props}
      kicker="Packs & convites"
      title={
        <>
          Seu pack, sua <Text className="text-brand-primary">corrida</Text>.
        </>
      }
      body="Adicione amigos, monte grupos e convide por link — quem toca no convite cai direto na corrida."
    >
      <View className="gap-3">
        <FloatingNotification />

        <View className="bg-surface-card rounded-3xl p-5">
          <View className="flex-row items-center gap-4">
            <LinearGradient
              colors={['#FF5A1F', '#C23A0E']}
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-white" style={{ ...numeric, fontSize: 16 }}>
                PF
              </Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-text-primary text-[16px] font-bold">Pack da Firma</Text>
              <Text className="text-text-secondary text-[13px] mt-0.5">
                8 membros · <Text className="text-status-success">2 correndo agora</Text>
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-surface-border">
            <MemberStack />
            <Text className="text-text-disabled text-[12px]">desde março</Text>
          </View>
        </View>

        <View
          className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5"
          style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.surface.border }}
        >
          <Ionicons name="link" size={16} color={colors.brand.primary} />
          <Text className="text-text-secondary text-[13px] flex-1" style={numeric}>
            runpack.app/i/xK4f9a
          </Text>
          <View className="bg-surface-elevated rounded-full px-2.5 py-1">
            <Text className="text-text-secondary text-[11px] font-semibold">expira em 24h</Text>
          </View>
        </View>
      </View>
    </SlideShell>
  );
}
