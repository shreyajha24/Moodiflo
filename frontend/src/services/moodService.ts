import { api } from './api';
import type { MoodSessionRequest, MoodSessionResponse, MoodView, QueryResponse, MusicPageResponse } from '../types';

export const moodService = {
  async getAllMoods(): Promise<MoodView[]> {
    const res = await api.get<MoodView[]>('/api/moods');
    return res.data;
  },

  async getDiscoverMoods(): Promise<MoodView[]> {
    const res = await api.get<MoodView[]>('/api/discover/moods');
    return res.data;
  },

  async getRecommendations(moodName: string, page = 0, limit = 20): Promise<MusicPageResponse> {
    const res = await api.get<MusicPageResponse>(`/api/moods/${encodeURIComponent(moodName)}/recommendations`, {
      params: { page, limit },
    });
    return res.data;
  },

  async createMoodSession(data: MoodSessionRequest): Promise<MoodSessionResponse> {
    const res = await api.post<MoodSessionResponse>('/api/mood-session', data);
    return res.data;
  },

  async discoverQuery(query: string): Promise<QueryResponse> {
    const res = await api.post<QueryResponse>('/api/discover/query', { query });
    return res.data;
  },
};
