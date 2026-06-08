import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@store/session.store';
import { useAuthStore } from '@store/auth.store';
import { sessionsService } from '../services/sessions.service';

export function useCreateSession() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const userId = useAuthStore((s) => s.user?.id);

  const mutation = useMutation({
    mutationFn: (groupId?: string) => sessionsService.createSession(groupId),
    onSuccess: (session) => {
      const joinedAt = session.joinedAt
        ? new Date(session.joinedAt).getTime()
        : Date.now();
      setSession(
        session.id,
        joinedAt,
        session.isParticipant && (userId != null),
        session.groupId,
        session.groupName,
      );
      router.push('/(modal)/live-session');
    },
  });

  return {
    createSession: (groupId?: string) => mutation.mutate(groupId),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
