import { api } from './api';
import type { PageResponse, SongView } from '../types';

export const searchService = {
  async search(q: string, page = 0, size = 20): Promise<PageResponse<SongView>> {
    const res = await api.get<PageResponse<SongView>>('/api/search', {
      params: { q, page, size },
    });
    return res.data;
  },
};
