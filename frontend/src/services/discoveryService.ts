import { api } from './api';
import type { SongView } from '../types';

export const discoveryService = {
  async getMood(mood: string, limit = 20): Promise<SongView[]> {
    const response = await api.get<SongView[]>(`/api/discovery/mood/${encodeURIComponent(mood)}`, { params: { limit } });
    return response.data;
  },
  async getJourney(limit = 12): Promise<SongView[]> {
    const response = await api.get<SongView[]>('/api/discovery/journey', { params: { limit } });
    return response.data;
  },
};
