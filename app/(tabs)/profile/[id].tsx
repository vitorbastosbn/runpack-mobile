import { useState } from 'react';
import { Alert, Image, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '@features/profile/hooks/useUserProfile';
import { useUserAchievements } from '@features/achievements/hooks/useUserAchievements';
import { useFriendActions } from '@features/friends/hooks/useFriends';
import { ScreenHeader } from '@shared/components/ScreenHeader';
import { SectionLabel } from '@shared/components/SectionLabel';
import { EmptyState } from '@shared/components/EmptyState';
import { Button, ButtonStack } from '@shared/components/Button';
import { colors } from '@constants/theme';
import { formatDistance, formatPace } from '@shared/utils/format';
import { useQueryClient } from '@tanstack/react-query';

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_run: 'footsteps',
  first_group_run: 'people',
  five_runs: 'medal',
  ten_km_total: 'trending-up',
  fifty_km_total: 'rocket',
  three_weeks_streak: 'flame',
  podium: 'trophy',
  fast_five: 'flash',
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 bg-surface-card rounded-[20px] px-3 py-4 items-center">
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

export default function UserProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, friendshipId, favorite } = useLocalSearchParams<{ id: string; friendshipId?: string; favorite?: string }>();
  const [isFavorite, setIsFavorite] = useState(favorite === '1');

  const { data: profile, isLoading, isError, refetch } = useUserProfile(id);
  const { data: achievements = [], isLoading: loadingAchievements } = useUserAchievements(id);
  const { removeFriend, updateFavorite } = useFriendActions();

  const handleRemoveFriend = () => {
    if (!friendshipId) return;
    Alert.alert(
      'Remover amigo',
      `Deseja remover ${profile?.name ?? 'este usuário'} da sua lista de amigos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeFriend.mutate(friendshipId, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['friends'] });
                router.back();
              },
            });
          },
        },
      ]
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

  const displayedAchievements = achievements.slice(0, 6);

  const handleToggleFavorite = () => {
    if (!friendshipId) return;
    const next = !isFavorite;
    setIsFavorite(next);
    updateFavorite.mutate(
      { id: friendshipId, favorite: next },
      { onError: () => setIsFavorite(!next) },
    );
  };

  return (
    <View className="flex-1 bg-surface-bg">
      <ScreenHeader title="Perfil" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Avatar + name + username */}
        <View className="items-center pt-6 pb-7 px-4">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} className="w-24 h-24 rounded-full mb-4" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-surface-elevated items-center justify-center mb-4">
              <Text className="text-text-primary text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-text-primary text-[22px] font-extrabold tracking-tight">{profile.name}</Text>
          <Text className="text-text-secondary text-sm mt-1">@{profile.username}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 gap-2.5 mb-7">
          <Stat label="Corridas" value={profile.totalRuns} />
          <Stat label="Total" value={formatDistance(profile.totalDistanceM)} />
          <Stat label="Pace" value={profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--'} />
        </View>

        {/* Achievements */}
        <View className="mx-5 mb-7">
          <SectionLabel label="Conquistas" />

          {loadingAchievements ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginVertical: 16 }} />
          ) : displayedAchievements.length === 0 ? (
            <EmptyState
              card
              icon="lock-closed-outline"
              title="Nenhuma conquista ainda"
              subtitle="Complete corridas para desbloquear conquistas"
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
              {displayedAchievements.map((a) => (
                <View key={a.id} style={{ width: '33.33%', padding: 4 }}>
                  <View
                    className="bg-surface-card rounded-[20px] items-center justify-center"
                    style={{ aspectRatio: 1, gap: 8 }}
                  >
                    <View className="w-11 h-11 rounded-full bg-surface-elevated items-center justify-center">
                      <Ionicons
                        name={(ACHIEVEMENT_ICONS[a.slug] ?? 'star') as any}
                        size={20}
                        color={colors.brand.primary}
                      />
                    </View>
                    <Text
                      className="text-text-primary text-xs font-semibold text-center"
                      numberOfLines={2}
                      style={{ paddingHorizontal: 8 }}
                    >
                      {a.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Friend actions */}
        {!!friendshipId && (
          <View className="mx-5">
            <ButtonStack>
              <Button
                label={isFavorite ? 'Acompanhando corridas' : 'Acompanhar corridas'}
                icon={isFavorite ? 'star' : 'star-outline'}
                variant="secondary"
                onPress={handleToggleFavorite}
                disabled={updateFavorite.isPending}
              />
              <Button
                label="Remover amigo"
                variant="danger"
                onPress={handleRemoveFriend}
                loading={removeFriend.isPending}
              />
            </ButtonStack>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
