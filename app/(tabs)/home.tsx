import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@shared/components/Avatar';
import { MemberAvatarStack } from '@shared/components/MemberAvatarStack';
import { useAuthStore } from '@store/auth.store';
import { useSessionStore } from '@store/session.store';
import { useCreateSession, useJoinSession } from '@features/sessions/hooks/useCreateSession';
import { useActiveRuns } from '@features/sessions/hooks/useActiveRuns';
import { StartRaceModal } from '@features/sessions/components/StartRaceModal';
import { useMyProfile } from '@features/profile/hooks/useMyProfile';
import { useGroups, useGroupMembers } from '@features/groups/hooks/useGroups';
import { useRunHistory } from '@features/history/hooks/useRunHistory';
import { formatDistance, formatDuration, formatPace, formatRank } from '@shared/utils/format';
import type { Group, GroupMember } from '@features/groups/types';
import type { ActiveRun } from '@features/sessions/types';
import type { RunSummary } from '@features/history/types';

const CARD_GRADIENTS: [string, string][] = [
  ['#F97316', '#C2410C'],
  ['#06B6D4', '#0369A1'],
  ['#22C55E', '#15803D'],
  ['#A855F7', '#7E22CE'],
  ['#F59E0B', '#B45309'],
];

const MAX_VISIBLE_AVATARS = 5;

function GroupCard({
  group,
  index,
  members,
  onPress,
}: {
  group: Group;
  index: number;
  members: GroupMember[];
  onPress: () => void;
}) {
  const [gradStart, gradEnd] = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <TouchableOpacity style={{ width: 164, marginRight: 12 }} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[gradStart, gradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: 16, height: 168 }}
      >
        {/* Decorative background icon */}
        <View style={{ position: 'absolute', right: -4, bottom: 28, opacity: 0.12 }}>
          <Ionicons name="walk" size={96} color="#fff" />
        </View>

        {/* Top: name + role badge */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
          <Text
            style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', flex: 1 }}
            numberOfLines={2}
          >
            {group.name}
          </Text>
          {group.myRole === 'admin' && (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginLeft: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>ADMIN</Text>
            </View>
          )}
        </View>

        {/* Big number */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 44, fontWeight: '800', lineHeight: 48 }}>
            {group.memberCount}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
            membros
          </Text>
        </View>

        {/* Bottom: real avatar stack */}
        <MemberAvatarStack
          members={members}
          totalCount={group.memberCount}
          borderColor={gradEnd}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function GroupCardWithMembers({
  group,
  index,
  onPress,
}: {
  group: Group;
  index: number;
  onPress: () => void;
}) {
  const { data: allMembers } = useGroupMembers(group.id);
  const members = (allMembers ?? []).slice(0, MAX_VISIBLE_AVATARS);
  return <GroupCard group={group} index={index} members={members} onPress={onPress} />;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 bg-surface-card rounded-2xl p-4 items-center justify-center">
      <Text className="text-text-primary text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text className="text-text-secondary text-xs mt-1 text-center">{label}</Text>
    </View>
  );
}

function RunCard({ run, onPress }: { run: RunSummary; onPress: () => void }) {
  const date = new Date(run.startedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  return (
    <TouchableOpacity
      className="bg-surface-card rounded-2xl mb-3 flex-row overflow-hidden"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="w-1 bg-brand-primary" />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-text-secondary text-xs mb-0.5">{date}</Text>
            <Text className="text-text-primary font-bold text-base">
              {formatDistance(run.totalDistanceM)}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              {formatDuration(run.totalTimeMs)} · {formatPace(run.avgPaceSkm)}
            </Text>
          </View>
          <View className="items-end ml-4">
            <Text className="text-2xl">{formatRank(run.finalRank)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ActiveGroupRunCard({
  run,
  onPress,
  disabled,
}: {
  run: ActiveRun;
  onPress: () => void;
  disabled: boolean;
}) {
  const isFriendRun = run.groupId == null;
  return (
    <TouchableOpacity
      className="bg-surface-card rounded-2xl mb-3 flex-row overflow-hidden"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View className="w-1 bg-status-success" />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#22C55E' }} />
              <Text className="text-status-success text-xs font-bold">Ao vivo</Text>
            </View>
            <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
              {isFriendRun ? run.creatorName : run.groupName}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              {isFriendRun
                ? `${run.participantCount} ${run.participantCount === 1 ? 'corredor' : 'corredores'}`
                : `${run.participantCount} correndo`}
            </Text>
          </View>
          <View className="items-center justify-center px-1">
            {disabled ? (
              <ActivityIndicator color="#F97316" size="small" />
            ) : (
              <Ionicons name="enter-outline" size={26} color="#F97316" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sessionId = useSessionStore((s) => s.sessionId);
  const { createSession, isLoading: isCreatingSession } = useCreateSession();
  const { joinSession, isLoading: isJoiningSession } = useJoinSession();

  const { data: profile, refetch: refetchProfile, isLoading: profileLoading } = useMyProfile();
  const { data: groupsData, refetch: refetchGroups, isLoading: groupsLoading } = useGroups();
  const { data: activeRuns = [], refetch: refetchActiveRuns, isLoading: activeRunsLoading } = useActiveRuns();
  const { data: historyData, refetch: refetchHistory, isLoading: historyLoading } = useRunHistory();

  const [refreshing, setRefreshing] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  // Refresh active runs each time home regains focus (covers members who
  // didn't receive a start/finish push).
  useFocusEffect(
    useCallback(() => {
      refetchActiveRuns();
    }, [refetchActiveRuns]),
  );

  const groups = groupsData ?? [];
  const visibleActiveRuns = activeRuns.slice(0, 3);
  const recentRuns = historyData?.pages[0]?.content.slice(0, 3) ?? [];
  const firstName = (profile?.name ?? user?.name ?? '').split(' ')[0];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchGroups(), refetchActiveRuns(), refetchHistory()]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Fixed header */}
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between bg-surface-bg">
        <View className="flex-1 mr-4">
          <Text className="text-text-secondary text-sm">Bem-vindo de volta,</Text>
          <Text className="text-text-primary text-2xl font-bold" numberOfLines={1}>
            {firstName || 'Corredor'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <View className="p-0.5 rounded-full border-2 border-brand-primary">
            <Avatar
              name={profile?.name ?? user?.name ?? '?'}
              avatarUrl={profile?.avatarUrl}
              size={42}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Active session banner */}
        {sessionId && (
          <TouchableOpacity
            className="border border-brand-primary rounded-2xl px-4 py-3 flex-row items-center justify-between mb-4"
            onPress={() => router.push('/(modal)/live-session')}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-brand-green" />
              <Text className="text-brand-green font-semibold">Corrida em andamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#22C55E" />
          </TouchableOpacity>
        )}

        {/* Stats */}
        {profileLoading ? (
          <View className="h-20 bg-surface-card rounded-2xl mb-6 items-center justify-center">
            <ActivityIndicator color="#F97316" />
          </View>
        ) : profile ? (
          <View className="flex-row gap-3 mb-6">
            <StatCard label="Corridas" value={profile.totalRuns} />
            <StatCard label="Total" value={formatDistance(profile.totalDistanceM)} />
            <StatCard
              label="Melhor pace"
              value={profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--'}
            />
          </View>
        ) : null}

        {/* Groups */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-primary font-bold text-base">Meus grupos</Text>
            {groups.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/groups')}>
                <Text className="text-brand-primary text-sm">Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>

          {groupsLoading ? (
            <ActivityIndicator color="#F97316" />
          ) : groups.length === 0 ? (
            <View className="bg-surface-card rounded-2xl p-5 items-center gap-3">
              <Ionicons name="people-outline" size={32} color="#52525B" />
              <Text className="text-text-secondary text-sm text-center">Nenhum grupo ainda</Text>
              <TouchableOpacity
                className="bg-brand-primary rounded-xl px-5 py-2"
                onPress={() => router.push('/(tabs)/groups/create')}
                activeOpacity={0.85}
              >
                <Text className="text-white text-sm font-semibold">Criar grupo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {groups.slice(0, 3).map((group, i) => (
                <GroupCardWithMembers
                  key={group.id}
                  group={group}
                  index={i}
                  onPress={() => router.push(`/(tabs)/groups/${group.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Active group runs */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="radio-outline" size={16} color="#22C55E" />
              <Text className="text-text-primary font-bold text-base">Corridas em andamento</Text>
            </View>
            {activeRuns.length > 3 && (
              <TouchableOpacity onPress={() => router.push('/active-runs')}>
                <Text className="text-brand-green text-sm">Ver todas ({activeRuns.length})</Text>
              </TouchableOpacity>
            )}
          </View>
          {activeRunsLoading ? (
            <ActivityIndicator color="#F97316" />
          ) : activeRuns.length === 0 ? (
            <View className="bg-surface-card rounded-2xl p-5 items-center gap-2">
              <Ionicons name="radio-outline" size={28} color="#52525B" />
              <Text className="text-text-secondary text-sm text-center">
                Nenhuma corrida em andamento
              </Text>
              <Text className="text-text-disabled text-xs text-center">
                Entre em um grupo quando alguém iniciar uma corrida
              </Text>
            </View>
          ) : (
            visibleActiveRuns.map((run) => (
              <ActiveGroupRunCard
                key={run.sessionId}
                run={run}
                disabled={isJoiningSession}
                onPress={() => joinSession(run.sessionId)}
              />
            ))
          )}
        </View>

        {/* Recent runs */}
        <View>
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text className="text-text-primary font-bold text-base">Corridas recentes</Text>
            </View>
            {recentRuns.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text className="text-brand-amber text-sm">Ver histórico</Text>
              </TouchableOpacity>
            )}
          </View>

          {historyLoading ? (
            <ActivityIndicator color="#F97316" />
          ) : recentRuns.length === 0 ? (
            <View className="bg-surface-card rounded-2xl p-6 items-center gap-3">
              <Ionicons name="footsteps-outline" size={32} color="#52525B" />
              <Text className="text-text-secondary text-sm text-center">
                Nenhuma corrida ainda.{'\n'}Toque no botão abaixo para começar!
              </Text>
            </View>
          ) : (
            recentRuns.map((run) => (
              <RunCard
                key={run.sessionId}
                run={run}
                onPress={() => router.push(`/(tabs)/history/${run.sessionId}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <StartRaceModal
        visible={goalModalVisible}
        loading={isCreatingSession}
        onClose={() => setGoalModalVisible(false)}
        onStart={(distanceGoalM) => {
          setGoalModalVisible(false);
          createSession({ distanceGoalM });
        }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 28, right: 20 }}
        className="w-16 h-16 bg-brand-primary rounded-full items-center justify-center"
        onPress={() => setGoalModalVisible(true)}
        disabled={isCreatingSession}
        activeOpacity={0.85}
      >
        {isCreatingSession ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="flash" size={28} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}
