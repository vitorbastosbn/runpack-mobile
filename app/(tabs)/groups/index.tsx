import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroups } from '@features/groups/hooks/useGroups';
import type { Group } from '@features/groups/types';
import { useCallback } from 'react';

export default function GroupsScreen() {
  const router = useRouter();
  const { data: groups = [], isLoading, refetch } = useGroups();

  const renderGroup = useCallback(({ item }: { item: Group }) => (
    <TouchableOpacity
      className="flex-row items-center bg-surface-card border border-surface-border rounded-xl px-4 py-3 mb-2"
      onPress={() => router.push(`/(tabs)/groups/${item.id}`)}
      activeOpacity={0.8}
    >
      <View className="w-11 h-11 rounded-xl bg-surface-elevated items-center justify-center mr-3">
        <Text className="text-brand-primary text-lg font-bold">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-semibold">{item.name}</Text>
        <Text className="text-text-secondary text-xs">
          {item.memberCount} {item.memberCount === 1 ? 'membro' : 'membros'} · {item.myRole === 'admin' ? 'Admin' : 'Membro'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#52525B" />
    </TouchableOpacity>
  ), [router]);

  return (
    <View className="flex-1 bg-surface-bg">
      <View className="px-4 pt-14 pb-4 flex-row items-center justify-between">
        <Text className="text-text-primary text-2xl font-bold">Grupos</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/groups/create')}
          className="w-9 h-9 bg-brand-primary rounded-xl items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#F97316" />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#F97316" style={{ marginTop: 32 }} />
          ) : (
            <View className="items-center mt-16">
              <Ionicons name="people-circle-outline" size={48} color="#3F3F46" />
              <Text className="text-text-secondary mt-4 text-center">
                Nenhum grupo ainda.{'\n'}Crie um ou aguarde um convite.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
