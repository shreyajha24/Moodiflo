import { api } from './api';
import type { MoodSessionRequest, MoodSessionResponse, MoodView, QueryResponse, SongView } from '../types';

export const moodService = {
  async getAllMoods(): Promise<MoodView[]> {
    const res = await api.get<MoodView[]>('/api/moods');
    return res.data;
  },

  async getDiscoverMoods(): Promise<MoodView[]> {
    const res = await api.get<MoodView[]>('/api/discover/moods');
    return res.data;
  },

  async getRecommendations(moodName: string): Promise<{ mood: string; songs: SongView[] }> {
    const res = await api.get<{ mood: string; songs: SongView[] }>(`/api/moods/${encodeURIComponent(moodName)}/recommendations`);
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
