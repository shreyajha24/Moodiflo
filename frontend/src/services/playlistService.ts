import { api } from './api';
import type { PlaylistRequest, PlaylistView, SongView } from '../types';

export const playlistService = {
  async getAllPlaylists(): Promise<PlaylistView[]> {
    const res = await api.get<PlaylistView[]>('/api/playlists');
    return res.data;
  },

  async getPlaylist(id: number): Promise<PlaylistView> {
    const res = await api.get<PlaylistView>(`/api/playlists/${id}`);
    return res.data;
  },

  async createPlaylist(data: PlaylistRequest): Promise<PlaylistView> {
    const res = await api.post<PlaylistView>('/api/playlists', data);
    return res.data;
  },

  async updatePlaylist(id: number, data: PlaylistRequest): Promise<PlaylistView> {
    const res = await api.put<PlaylistView>(`/api/playlists/${id}`, data);
    return res.data;
  },

  async deletePlaylist(id: number): Promise<void> {
    await api.delete(`/api/playlists/${id}`);
  },

  async getPlaylistSongs(playlistId: number): Promise<SongView[]> {
    const res = await api.get<SongView[]>(`/api/playlists/${playlistId}/songs`);
    return res.data;
  },

  async addSong(playlistId: number, songId: number): Promise<PlaylistView> {
    const res = await api.post<PlaylistView>(`/api/playlists/${playlistId}/songs/${songId}`);
    return res.data;
  },

  async removeSong(playlistId: number, songId: number): Promise<void> {
    await api.delete(`/api/playlists/${playlistId}/songs/${songId}`);
  },
};
