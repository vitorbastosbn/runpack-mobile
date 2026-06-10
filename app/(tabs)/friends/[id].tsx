import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '@features/profile/hooks/useUserProfile';
import { useUserAchievements } from '@features/achievements/hooks/useUserAchievements';
import { useFriendActions } from '@features/friends/hooks/useFriends';
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

export default function FriendProfileScreen() {
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
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-8">
        <Text className="text-text-primary text-base text-center mb-4">Perfil não disponível</Text>
        <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-xl" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
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
      <View className="flex-row items-center px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3" hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold flex-1">Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="items-center pt-8 pb-6 px-4">
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} className="w-20 h-20 rounded-full mb-3" />
          ) : (
            <View className="w-20 h-20 rounded-full bg-surface-elevated items-center justify-center mb-3">
              <Text className="text-text-primary text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-text-primary text-xl font-bold">{profile.name}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">@{profile.username}</Text>
        </View>

        <View className="flex-row mx-5 gap-3 mb-6">
          <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
            <Text className="text-brand-green text-2xl font-bold">{profile.totalRuns}</Text>
            <Text className="text-text-secondary text-xs mt-1">corridas</Text>
          </View>
          <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
            <Text className="text-brand-cyan text-2xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
              {formatDistance(profile.totalDistanceM)}
            </Text>
            <Text className="text-text-secondary text-xs mt-1">total</Text>
          </View>
          <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center">
            <Text className="text-brand-amber text-2xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
              {profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--'}
            </Text>
            <Text className="text-text-secondary text-xs mt-1">melhor pace</Text>
          </View>
        </View>

        <View className="mx-5 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="trophy" size={16} color="#A855F7" />
            <Text className="text-text-primary font-bold text-base">Conquistas</Text>
          </View>

          {loadingAchievements ? (
            <ActivityIndicator color="#F97316" style={{ marginVertical: 16 }} />
          ) : displayedAchievements.length === 0 ? (
            <View className="bg-surface-card rounded-2xl p-5 items-center gap-2">
              <Ionicons name="lock-closed-outline" size={28} color="#52525B" />
              <Text className="text-text-disabled text-sm text-center">
                Complete corridas para desbloquear conquistas
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4 }}>
              {displayedAchievements.map((a) => (
                <View key={a.id} style={{ width: '33.33%', padding: 4 }}>
                  <View
                    className="bg-surface-card rounded-2xl items-center justify-center"
                    style={{ aspectRatio: 1, gap: 8 }}
                  >
                    <View className="w-12 h-12 rounded-full bg-surface-elevated items-center justify-center">
                      <Ionicons
                        name={(ACHIEVEMENT_ICONS[a.slug] ?? 'star') as any}
                        size={24}
                        color="#A855F7"
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

        {!!friendshipId && (
          <View className="mx-5 gap-3">
            <TouchableOpacity
              onPress={handleToggleFavorite}
              disabled={updateFavorite.isPending}
              className={`bg-surface-card border rounded-2xl py-4 px-4 flex-row items-center justify-center gap-2 ${
                isFavorite ? 'border-brand-amber' : 'border-surface-border'
              }`}
            >
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={20}
                color={isFavorite ? '#FACC15' : '#A1A1AA'}
              />
              <Text className={isFavorite ? 'text-brand-amber font-semibold' : 'text-text-primary font-semibold'}>
                {isFavorite ? 'Acompanhando corridas' : 'Acompanhar corridas'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRemoveFriend}
              disabled={removeFriend.isPending}
              className="bg-surface-card border border-status-error rounded-2xl py-4 items-center"
            >
              {removeFriend.isPending ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <Text className="text-status-error font-semibold">Remover amigo</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
