import { useMutation } from '@tanstack/react-query';
import { sessionsService } from '../services/sessions.service';

export function useFinishSession() {
  return useMutation({
    mutationFn: (sessionId: string) => sessionsService.finishSession(sessionId),
  });
}

export function useLeaveSession() {
  return useMutation({
    mutationFn: (sessionId: string) => sessionsService.leaveSession(sessionId),
  });
}
