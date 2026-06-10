import { useQuery } from '@tanstack/react-query';
import { sessionsService } from '../services/sessions.service';

// Shared key so push / focus / session-finished can invalidate the home list.
export const ACTIVE_RUNS_KEY = ['sessions', 'active'];

export function useActiveRuns() {
  return useQuery({
    queryKey: ACTIVE_RUNS_KEY,
    queryFn: sessionsService.getActiveRuns,
  });
}
