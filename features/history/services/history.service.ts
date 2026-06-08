import { http } from '@shared/utils/http';
import type { RunSummary, RunDetail, Page } from '../types';

export const historyService = {
  async getRunHistory(page: number, size = 20): Promise<Page<RunSummary>> {
    const { data } = await http.get('/users/me/runs', { params: { page, size } });
    return data;
  },

  async getRunDetail(sessionId: string): Promise<RunDetail> {
    const { data } = await http.get(`/runs/${sessionId}`);
    return data;
  },
};
