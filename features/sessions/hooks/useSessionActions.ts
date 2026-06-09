import { useMutation } from '@tanstack/react-query';
import { sessionsService } from '../services/sessions.service';

interface FinishSessionParams {
  sessionId: string;
  elapsedMs: number;
  distanceM: number;
  paceSKm: number;
}

export function useFinishSession() {
  return useMutation({
    mutationFn: ({ sessionId, elapsedMs, distanceM, paceSKm }: FinishSessionParams) =>
      sessionsService.finishSession(sessionId, { elapsedMs, distanceM, paceSKm }),
  });
}

export function useLeaveSession() {
  return useMutation({
    mutationFn: (sessionId: string) => sessionsService.leaveSession(sessionId),
  });
}
