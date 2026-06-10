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
import { colors } from '@constants/theme';
import { groupGradient } from '@shared/utils/groupColors';
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

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel(): string {
  const label = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ---------------------------------- blocks --------------------------------- */

function GroupCard({
  group,
  members,
  onPress,
}: {
  group: Group;
  members: GroupMember[];
  onPress: () => void;
}) {
  const [gradStart, gradEnd] = groupGradient(group.id);

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

function GroupCardWithMembers({ group, onPress }: { group: Group; onPress: () => void }) {
  const { data: allMembers } = useGroupMembers(group.id);
  const members = (allMembers ?? []).slice(0, MAX_VISIBLE_AVATARS);
  return <GroupCard group={group} members={members} onPress={onPress} />;
}

function StatStrip({
  totalRuns,
  totalDistanceM,
  bestPaceSkm,
}: {
  totalRuns: number;
  totalDistanceM: number;
  bestPaceSkm: number;
}) {
  const items = [
    { label: 'Corridas', value: String(totalRuns) },
    { label: 'Total', value: formatDistance(totalDistanceM) },
    { label: 'Melhor pace', value: bestPaceSkm > 0 ? formatPace(bestPaceSkm) : '--:--' },
  ];
  return (
    <View className="bg-surface-card rounded-[20px] flex-row py-5 mb-7">
      {items.map((item, i) => (
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
  );
}

function LiveRunRow({
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
          {run.participantCount} {run.participantCount === 1 ? 'corredor' : 'correndo'}
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

function RecentRunRow({
  run,
  isLast,
  onPress,
}: {
  run: RunSummary;
  isLast: boolean;
  onPress: () => void;
}) {
  const date = new Date(run.startedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  return (
    <TouchableOpacity
      className={`flex-row items-center py-3.5 ${isLast ? '' : 'border-b border-surface-border'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12">
        <Text className="text-text-secondary text-xs">{date}</Text>
      </View>
      <View className="flex-1 ml-2">
        <Text
          className="text-text-primary font-extrabold text-[16px]"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatDistance(run.totalDistanceM)}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5">
          {formatDuration(run.totalTimeMs)} · {formatPace(run.avgPaceSkm)}
          {run.groupName ? ` · ${run.groupName}` : ''}
        </Text>
      </View>
      <Text className="text-xl ml-3">{formatRank(run.finalRank)}</Text>
    </TouchableOpacity>
  );
}

/* ---------------------------------- screen --------------------------------- */

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
  const recentRuns = historyData?.pages[0]?.content.slice(0, 4) ?? [];
  const firstName = (profile?.name ?? user?.name ?? '').split(' ')[0];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchGroups(), refetchActiveRuns(), refetchHistory()]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Header — date + greeting + avatar */}
      <View className="px-5 pt-14 pb-5 flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text
            className="text-text-secondary text-[11px] font-semibold uppercase"
            style={{ letterSpacing: 1.4 }}
          >
            {todayLabel()}
          </Text>
          <Text
            className="text-text-primary text-[26px] font-extrabold tracking-tight mt-0.5"
            numberOfLines={1}
          >
            {greetingForNow()}, {firstName || 'Corredor'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
        >
          <Avatar name={profile?.name ?? user?.name ?? '?'} avatarUrl={profile?.avatarUrl} size={44} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        {profileLoading ? (
          <View className="h-20 bg-surface-card rounded-[20px] mb-7 items-center justify-center">
            <ActivityIndicator color={colors.brand.primary} />
          </View>
        ) : profile ? (
          <StatStrip
            totalRuns={profile.totalRuns}
            totalDistanceM={profile.totalDistanceM}
            bestPaceSkm={profile.bestPaceSkm}
          />
        ) : null}

        {/* Live now */}
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
              subtitle="Quando um amigo ou grupo iniciar uma corrida, ela aparece aqui"
            />
          ) : (
            visibleActiveRuns.map((run) => (
              <LiveRunRow
                key={run.sessionId}
                run={run}
                disabled={isJoiningSession}
                onPress={() => joinSession(run.sessionId)}
              />
            ))
          )}
        </View>

        {/* Groups rail */}
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
              {groups.slice(0, 5).map((group) => (
                <GroupCardWithMembers
                  key={group.id}
                  group={group}
                  onPress={() => router.push(`/(tabs)/groups/${group.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent runs — flat editorial list */}
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
            <View>
              {recentRuns.map((run, i) => (
                <RecentRunRow
                  key={run.sessionId}
                  run={run}
                  isLast={i === recentRuns.length - 1}
                  onPress={() => router.push(`/(tabs)/history/${run.sessionId}`)}
                />
              ))}
            </View>
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

      {/* Docked action — start a run, or get back to the live one */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-surface-bg">
        {sessionId ? (
          <TouchableOpacity
            className="h-14 rounded-2xl bg-surface-elevated flex-row items-center justify-center gap-2.5"
            onPress={() => router.push('/(modal)/live-session')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Voltar à corrida em andamento"
          >
            <View className="w-2 h-2 rounded-full bg-status-success" />
            <Text className="text-text-primary font-bold text-base">Voltar à corrida</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.status.success} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="h-14 rounded-2xl bg-brand-primary flex-row items-center justify-center gap-2"
            style={{
              shadowColor: colors.brand.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 10,
            }}
            onPress={() => setGoalModalVisible(true)}
            disabled={isCreatingSession}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Iniciar corrida"
          >
            {isCreatingSession ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#fff" />
                <Text className="text-white font-bold text-base">Iniciar corrida</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
