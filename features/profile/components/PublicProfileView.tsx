import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { AdBanner } from '@shared/components/AdBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '@features/profile/hooks/useUserProfile';
import { useUserAchievements } from '@features/achievements/hooks/useUserAchievements';
import { useFriendActions } from '@features/friends/hooks/useFriends';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { SectionLabel } from '@shared/components/SectionLabel';
import { Button } from '@shared/components/Button';
import { MoreMenu } from '@shared/components/MoreMenu';
import { confirmAction } from '@shared/components/AppDialogs';
import { colors } from '@constants/theme';
import { formatPace } from '@shared/utils/format';
import { useQueryClient } from '@tanstack/react-query';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Catálogo fechado do MVP — bloqueadas aparecem como objetivos.
const ACHIEVEMENT_CATALOG: { slug: string; name: string; icon: IoniconsName }[] = [
  { slug: 'first_run', name: 'Primeira corrida', icon: 'footsteps' },
  { slug: 'first_group_run', name: 'Em grupo', icon: 'people' },
  { slug: 'five_runs', name: '5 corridas', icon: 'medal' },
  { slug: 'ten_km_total', name: '10 km no total', icon: 'trending-up' },
  { slug: 'fifty_km_total', name: '50 km no total', icon: 'rocket' },
  { slug: 'three_weeks_streak', name: '3 semanas seguidas', icon: 'flame' },
  { slug: 'podium', name: 'Pódio', icon: 'trophy' },
  { slug: 'fast_five', name: '5 km em 30 min', icon: 'flash' },
];

function formatKm(totalDistanceM: number): string {
  const km = totalDistanceM / 1000;
  return km.toLocaleString('pt-BR', {
    minimumFractionDigits: km > 0 && km < 100 ? 1 : 0,
    maximumFractionDigits: km < 100 ? 1 : 0,
  });
}

function AchievementTile({
  name,
  icon,
  unlocked,
}: {
  name: string;
  icon: IoniconsName;
  unlocked: boolean;
}) {
  return (
    <View
      className={`bg-surface-card rounded-[20px] items-center justify-center ${unlocked ? '' : 'opacity-60'}`}
      style={{ aspectRatio: 1, gap: 8 }}
    >
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${
          unlocked ? 'bg-surface-elevated' : ''
        }`}
        style={unlocked ? undefined : { backgroundColor: '#17171B' }}
      >
        <Ionicons
          name={unlocked ? icon : 'lock-closed'}
          size={unlocked ? 20 : 16}
          color={unlocked ? colors.brand.primary : colors.text.disabled}
        />
      </View>
      <Text
        className={`text-xs font-semibold text-center ${unlocked ? 'text-text-primary' : 'text-text-disabled'}`}
        numberOfLines={2}
        style={{ paddingHorizontal: 8 }}
      >
        {name}
      </Text>
    </View>
  );
}

interface PublicProfileViewProps {
  id: string;
  friendshipId?: string;
  favorite?: string;
}

export function PublicProfileView({ id, friendshipId, favorite }: PublicProfileViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(favorite === '1');

  const { data: profile, isLoading, isError, refetch } = useUserProfile(id);
  const { data: achievements = [], isLoading: loadingAchievements } = useUserAchievements(id);
  const { removeFriend, updateFavorite } = useFriendActions();

  const handleRemoveFriend = async () => {
    if (!friendshipId) return;
    const ok = await confirmAction({
      title: 'Remover amigo',
      message: `${profile?.name ?? 'Este usuário'} sairá da sua lista de amigos.`,
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (!ok) return;
    removeFriend.mutate(friendshipId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        router.back();
      },
    });
  };

  const handleToggleFavorite = () => {
    if (!friendshipId) return;
    const next = !isFavorite;
    setIsFavorite(next);
    updateFavorite.mutate(
      { id: friendshipId, favorite: next },
      { onError: () => setIsFavorite(!next) },
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Text className="text-text-primary text-base text-center mb-6">Perfil não disponível</Text>
        <Button label="Tentar novamente" onPress={() => refetch()} />
      </View>
    );
  }

  const unlockedSlugs = new Set(achievements.map((a) => a.slug));
  const unlockedCount = ACHIEVEMENT_CATALOG.filter((c) => unlockedSlugs.has(c.slug)).length;

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader title="Perfil" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Identity — left aligned, editorial */}
        <View className="flex-row items-center px-5 pt-4 gap-4">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} className="w-16 h-16 rounded-full" />
          ) : (
            <View className="w-16 h-16 rounded-full bg-surface-elevated items-center justify-center">
              <Text className="text-text-primary text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-text-primary text-[24px] font-extrabold tracking-tight" numberOfLines={1}>
              {profile.name}
            </Text>
            <Text className="text-text-secondary text-[13px] mt-0.5" numberOfLines={1}>
              @{profile.username}
            </Text>
          </View>
        </View>

        {/* Friend actions — compact bar, Instagram-style */}
        {!!friendshipId && (
          <View className="flex-row items-center px-5 mt-5 gap-2">
            <TouchableOpacity
              onPress={handleToggleFavorite}
              disabled={updateFavorite.isPending}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Parar de acompanhar corridas' : 'Acompanhar corridas'}
              className="flex-1 h-9 rounded-xl bg-surface-card flex-row items-center justify-center gap-1.5"
            >
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={14}
                color={isFavorite ? colors.brand.primary : colors.text.secondary}
              />
              <Text
                className={`text-[13px] font-semibold ${
                  isFavorite ? 'text-brand-primary' : 'text-text-primary'
                }`}
              >
                {isFavorite ? 'Acompanhando' : 'Acompanhar corridas'}
              </Text>
            </TouchableOpacity>
            <MoreMenu
              loading={removeFriend.isPending}
              items={[
                {
                  label: 'Remover amigo',
                  icon: 'person-remove-outline',
                  destructive: true,
                  onPress: handleRemoveFriend,
                },
              ]}
            />
          </View>
        )}

        {/* Odometer */}
        <View className="px-5 pt-9 pb-8">
          <View className="flex-row items-baseline">
            <Text
              className="text-text-primary font-extrabold"
              style={{ fontSize: 64, lineHeight: 68, letterSpacing: -2.5, fontVariant: ['tabular-nums'] }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatKm(profile.totalDistanceM)}
            </Text>
            <Text className="text-brand-primary text-2xl font-extrabold ml-1.5">km</Text>
          </View>
          <Text
            className="text-text-secondary text-[11px] font-semibold uppercase mt-1"
            style={{ letterSpacing: 1.6 }}
          >
            Percorridos até hoje
          </Text>
        </View>

        {/* Stat strip */}
        <View className="mx-5 bg-surface-card rounded-[20px] flex-row py-5">
          {[
            { label: 'Corridas', value: String(profile.totalRuns) },
            { label: 'Melhor pace', value: profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--' },
            { label: 'Conquistas', value: `${unlockedCount}/${ACHIEVEMENT_CATALOG.length}` },
          ].map((item, i) => (
            <View
              key={item.label}
              className={`flex-1 items-center ${i > 0 ? 'border-l border-surface-border' : ''}`}
            >
              <Text
                className="text-text-primary text-lg font-extrabold"
                style={{ fontVariant: ['tabular-nums'] }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item.value}
              </Text>
              <Text
                className="text-text-secondary text-[10px] font-semibold uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Achievements — full catalog with locked goals */}
        <View className="mx-5 mt-7">
          <SectionLabel label={`Conquistas · ${unlockedCount} de ${ACHIEVEMENT_CATALOG.length}`} />
          {loadingAchievements ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
              {ACHIEVEMENT_CATALOG.map((item) => (
                <View key={item.slug} style={{ width: '25%', padding: 4 }}>
                  <AchievementTile
                    name={item.name}
                    icon={item.icon}
                    unlocked={unlockedSlugs.has(item.slug)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
      <AdBanner />
    </View>
  );
}
