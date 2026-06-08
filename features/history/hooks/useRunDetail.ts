import { useQuery } from '@tanstack/react-query';
import { historyService } from '../services/history.service';

export function useRunDetail(sessionId: string) {
  return useQuery({
    queryKey: ['run-detail', sessionId],
    queryFn: () => historyService.getRunDetail(sessionId),
    enabled: !!sessionId,
  });
}
