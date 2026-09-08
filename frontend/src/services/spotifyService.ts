import { api } from './api';
import type { SongView, SpotifyStatusView } from '../types';

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
<<<<<<< HEAD
  async search(query: string, offset = 0, limit = 20): Promise<SongView[]> {
    const response = await api.get<SongView[]>('/api/spotify/search', {
=======
  async search(query: string, offset = 0, limit = 20): Promise<import('../types').SongView[]> {
    const response = await api.get<import('../types').SongView[]>('/api/spotify/search', {
>>>>>>> 883cd514840436824f835fb925a0a25d880252f0
      params: { q: query, offset, limit },
    });
    return response.data;
  },
};
