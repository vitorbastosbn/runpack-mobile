import { useInfiniteQuery } from '@tanstack/react-query';
import { historyService } from '../services/history.service';
import type { RunSummary, Page } from '../types';

export function useRunHistory() {
  return useInfiniteQuery<Page<RunSummary>, Error>({
    queryKey: ['run-history'],
    queryFn: ({ pageParam = 0 }) => historyService.getRunHistory(pageParam as number),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    initialPageParam: 0,
  });
}
