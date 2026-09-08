import { api } from './api';
import type { SpotifyStatusView } from '../types';

export const spotifyService = {
  async getStatus(): Promise<SpotifyStatusView> {
    const response = await api.get<SpotifyStatusView>('/api/spotify/status');
    return response.data;
  },
  async getAuthorizationUrl(): Promise<string> {
    const response = await api.get<{ authUrl: string }>('/api/spotify/authorize');
    return response.data.authUrl;
  },
  async getAccessToken(): Promise<string> {
    const response = await api.get<{ accessToken: string }>('/api/spotify/token');
    return response.data.accessToken;
  },
  async disconnect(): Promise<void> {
    await api.delete('/api/spotify/connection');
  },
  async search(query: string, offset = 0, limit = 20): Promise<import('../types').SongView[]> {
    const response = await api.get<import('../types').SongView[]>('/api/spotify/search', {
      params: { q: query, offset, limit },
    });
    return response.data;
  },
};
