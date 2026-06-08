import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUserProfile } from '@features/profile/hooks/useUserProfile';
import { formatDistance, formatPace } from '@shared/utils/format';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: profile, isLoading, isError, refetch } = useUserProfile(id);

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
        <Text className="text-text-primary text-base text-center mb-4">
          Perfil não disponível
        </Text>
        <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-xl" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface-bg" contentContainerStyle={{ paddingBottom: 32 }}>
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
        <Text className="text-text-secondary text-sm">@{profile.username}</Text>
      </View>

      <View className="flex-row mx-4 gap-3">
        <View className="flex-1 bg-surface-card rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">{profile.totalRuns}</Text>
          <Text className="text-text-secondary text-xs">corridas</Text>
        </View>
        <View className="flex-1 bg-surface-card rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">
            {formatDistance(profile.totalDistanceM)}
          </Text>
          <Text className="text-text-secondary text-xs">total</Text>
        </View>
        <View className="flex-1 bg-surface-card rounded-xl p-4 items-center">
          <Text className="text-text-primary text-2xl font-bold">
            {formatPace(profile.bestPaceSkm)}
          </Text>
          <Text className="text-text-secondary text-xs">melhor pace</Text>
        </View>
      </View>
    </ScrollView>
  );
}
