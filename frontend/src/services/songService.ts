import { api } from './api';
import type { LyricsLookupView, PageResponse, SongView, TextTranslationView, TranslationView } from '../types';

export const songService = {
  async getAllSongs(page = 0, size = 20): Promise<PageResponse<SongView>> {
    const res = await api.get<PageResponse<SongView>>('/api/songs', {
      params: { page, size },
    });
    return res.data;
  },

  async getSong(id: number): Promise<SongView> {
    const res = await api.get<SongView>(`/api/songs/${id}`);
    return res.data;
  },

  async searchSongs(query: string, page = 0, size = 20): Promise<PageResponse<SongView>> {
    const res = await api.get<PageResponse<SongView>>('/api/songs/search', {
      params: { query, page, size },
    });
    return res.data;
  },

  async getLyrics(songId: number): Promise<string[]> {
    const res = await api.get<string[]>(`/api/songs/${songId}/lyrics`);
    return res.data;
  },

  async getLyricsForTrack(song: SongView): Promise<LyricsLookupView> {
    if (song.spotifyTrackId || song.spotifyUri || song.id < 0) {
      const res = await api.get<LyricsLookupView>('/api/lyrics', { params: { title: song.title, artist: song.artist } });
      return res.data;
    }
    const lyrics = await this.getLyrics(song.id);
    return lyrics.length > 0
      ? { available: true, language: song.language || 'English', lyrics: lyrics.join('\n') }
      : { available: false, message: 'Lyrics are not available for this song.' };
  },

  async getTranslations(songId: number): Promise<TranslationView[]> {
    const res = await api.get<TranslationView[]>(`/api/songs/${songId}/translations`);
    return res.data;
  },

  async translateLyrics(songId: number, targetLanguage: string): Promise<TranslationView> {
    const res = await api.post<TranslationView>(`/api/songs/${songId}/translate`, {
      targetLanguage,
    });
    return res.data;
  },

  async translateText(text: string, targetLanguage: string, sourceLanguage = 'English'): Promise<TextTranslationView> {
    const res = await api.post<TextTranslationView>('/api/translation', { text, targetLanguage, sourceLanguage });
    return res.data;
  },
};
