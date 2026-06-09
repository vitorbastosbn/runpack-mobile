import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@store/session.store';
import { useAuthStore } from '@store/auth.store';
import { sessionsService } from '../services/sessions.service';

function clampJoinedAt(serverIso?: string): number {
  const serverMs = serverIso ? new Date(serverIso).getTime() : Date.now();
  return Math.min(serverMs, Date.now());
}

interface CreateSessionParams {
  groupId?: string;
  distanceGoalM?: number | null;
}

export function useCreateSession() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const userId = useAuthStore((s) => s.user?.id);

  const mutation = useMutation({
    mutationFn: ({ groupId, distanceGoalM }: CreateSessionParams) =>
      sessionsService.createSession(groupId, distanceGoalM),
    onSuccess: (session) => {
      setSession(
        session.id,
        clampJoinedAt(session.joinedAt),
        session.isParticipant && userId != null,
        session.groupId,
        session.groupName,
        session.distanceGoalM,
      );
      router.push('/(modal)/live-session');
    },
  });

  return {
    createSession: (params: CreateSessionParams) => mutation.mutate(params),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useJoinSession() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  const mutation = useMutation({
    mutationFn: (sessionId: string) => sessionsService.joinSession(sessionId),
    onSuccess: (session) => {
      setSession(
        session.id,
        clampJoinedAt(session.joinedAt),
        false,
        session.groupId,
        session.groupName,
        session.distanceGoalM,
      );
      router.push('/(modal)/live-session');
    },
  });

  return {
    joinSession: (sessionId: string) => mutation.mutate(sessionId),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
