import { api } from './api';
import type { HistoryRequest, SongView } from '../types';

export const historyService = {
  async getHistory(): Promise<SongView[]> {
    const res = await api.get<SongView[]>('/api/listening-history');
    return res.data;
  },

  async recordHistory(data: HistoryRequest): Promise<void> {
    await api.post('/api/listening-history', data);
  },
};
