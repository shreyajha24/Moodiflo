import { api } from './api';
import type { SongView } from '../types';

export const favoriteService = {
  async getFavorites(): Promise<SongView[]> {
    const res = await api.get<SongView[]>('/api/users/me/favorites');
    return res.data;
  },

  async addFavorite(songId: number): Promise<void> {
    await api.post(`/api/users/me/favorites/${songId}`);
  },

  async removeFavorite(songId: number): Promise<void> {
    await api.delete(`/api/users/me/favorites/${songId}`);
  },
};
