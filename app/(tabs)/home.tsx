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
import { SectionLabel } from '@shared/components/SectionLabel';
import { EmptyState } from '@shared/components/EmptyState';
import { Fab } from '@shared/components/Fab';
import { colors } from '@constants/theme';
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

const MAX_VISIBLE_AVATARS = 5;

// Gradientes profundos, harmonizados com o acento #FF5A1F — ricos sem virar arco-íris.
const CARD_GRADIENTS: [string, string][] = [
  ['#FF5A1F', '#B23000'], // laranja — assinatura
  ['#0E7490', '#063A4A'], // petróleo
  ['#15803D', '#073D1E'], // verde profundo
  ['#6D28D9', '#34106E'], // violeta
  ['#B45309', '#5C2A04'], // âmbar queimado
];

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
    <TouchableOpacity style={{ width: 160, marginRight: 12 }} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[gradStart, gradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: 16, height: 164, overflow: 'hidden' }}
      >
        {/* Decorative run icon */}
        <View style={{ position: 'absolute', right: -8, bottom: 24, opacity: 0.14 }}>
          <Ionicons name="walk" size={96} color="#fff" />
        </View>

        <View className="flex-row items-start">
          <Text className="text-white text-[13px] font-bold flex-1" numberOfLines={2}>
            {group.name}
          </Text>
          {group.myRole === 'admin' && (
            <View className="bg-white/20 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-white font-bold" style={{ fontSize: 9, letterSpacing: 0.5 }}>
                ADMIN
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 justify-center">
          <Text
            className="text-white text-[40px] font-extrabold"
            style={{ fontVariant: ['tabular-nums'], letterSpacing: -1 }}
          >
            {group.memberCount}
          </Text>
          <Text className="text-white/70 text-xs -mt-1">
            {group.memberCount === 1 ? 'membro' : 'membros'}
          </Text>
        </View>

        <MemberAvatarStack members={members} totalCount={group.memberCount} borderColor={gradEnd} />
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

function RunCard({ run, onPress }: { run: RunSummary; onPress: () => void }) {
  const date = new Date(run.startedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  return (
    <TouchableOpacity
      className="bg-surface-card rounded-[20px] mb-2.5 px-4 py-4 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-1">
        <Text className="text-text-secondary text-xs mb-1">{date}</Text>
        <Text
          className="text-text-primary font-extrabold text-lg"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatDistance(run.totalDistanceM)}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">
          {formatDuration(run.totalTimeMs)} · {formatPace(run.avgPaceSkm)}
        </Text>
      </View>
      <Text className="text-2xl ml-4">{formatRank(run.finalRank)}</Text>
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
      className="bg-surface-card rounded-[20px] mb-2.5 px-4 py-4 flex-row items-center justify-between gap-3"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-status-success" />
          <Text
            className="text-status-success text-[10px] font-bold uppercase"
            style={{ letterSpacing: 1 }}
          >
            Ao vivo
          </Text>
        </View>
        <Text className="text-text-primary font-bold text-[15px]" numberOfLines={1}>
          {isFriendRun ? run.creatorName : run.groupName}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">
          {isFriendRun
            ? `${run.participantCount} ${run.participantCount === 1 ? 'corredor' : 'corredores'}`
            : `${run.participantCount} correndo`}
        </Text>
      </View>
      <View className="w-10 h-10 rounded-full bg-surface-elevated items-center justify-center">
        {disabled ? (
          <ActivityIndicator color={colors.brand.primary} size="small" />
        ) : (
          <Ionicons name="arrow-forward" size={18} color={colors.brand.primary} />
        )}
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
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-text-secondary text-sm">Bem-vindo de volta,</Text>
          <Text
            className="text-text-primary text-[26px] font-extrabold tracking-tight"
            numberOfLines={1}
          >
            {firstName || 'Corredor'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
          <Avatar name={profile?.name ?? user?.name ?? '?'} avatarUrl={profile?.avatarUrl} size={44} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Active session banner */}
        {sessionId && (
          <TouchableOpacity
            className="bg-surface-card rounded-[20px] px-4 py-3.5 flex-row items-center justify-between mb-5"
            onPress={() => router.push('/(modal)/live-session')}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-2 h-2 rounded-full bg-status-success" />
              <Text className="text-text-primary font-semibold text-sm">Corrida em andamento</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.status.success} />
          </TouchableOpacity>
        )}

        {/* Stats */}
        {profileLoading ? (
          <View className="h-20 bg-surface-card rounded-[20px] mb-7 items-center justify-center">
            <ActivityIndicator color={colors.brand.primary} />
          </View>
        ) : profile ? (
          <View className="flex-row gap-2.5 mb-7">
            <StatCard label="Corridas" value={profile.totalRuns} />
            <StatCard label="Total" value={formatDistance(profile.totalDistanceM)} />
            <StatCard
              label="Pace"
              value={profile.bestPaceSkm > 0 ? formatPace(profile.bestPaceSkm) : '--:--'}
            />
          </View>
        ) : null}

        {/* Groups */}
        <View className="mb-7">
          <SectionLabel
            label="Meus grupos"
            action={groups.length > 0 ? 'Ver todos' : undefined}
            onAction={() => router.push('/(tabs)/groups')}
          />

          {groupsLoading ? (
            <ActivityIndicator color={colors.brand.primary} />
          ) : groups.length === 0 ? (
            <EmptyState
              card
              icon="people-outline"
              title="Nenhum grupo ainda"
              cta="Criar grupo"
              onPress={() => router.push('/(tabs)/groups/create')}
            />
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
        <View className="mb-7">
          <SectionLabel
            label="Ao vivo agora"
            action={activeRuns.length > 3 ? `Ver todas (${activeRuns.length})` : undefined}
            onAction={() => router.push('/active-runs')}
          />
          {activeRunsLoading ? (
            <ActivityIndicator color={colors.brand.primary} />
          ) : activeRuns.length === 0 ? (
            <EmptyState
              card
              icon="radio-outline"
              title="Nenhuma corrida em andamento"
              subtitle="Entre em um grupo quando alguém iniciar uma corrida"
            />
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
          <SectionLabel
            label="Corridas recentes"
            action={recentRuns.length > 0 ? 'Ver histórico' : undefined}
            onAction={() => router.push('/(tabs)/history')}
          />

          {historyLoading ? (
            <ActivityIndicator color={colors.brand.primary} />
          ) : recentRuns.length === 0 ? (
            <EmptyState
              card
              icon="footsteps-outline"
              title="Nenhuma corrida ainda"
              subtitle="Toque no botão abaixo para começar!"
            />
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

      <Fab
        icon="flash"
        onPress={() => setGoalModalVisible(true)}
        loading={isCreatingSession}
        accessibilityLabel="Iniciar corrida"
      />
    </View>
  );
}
