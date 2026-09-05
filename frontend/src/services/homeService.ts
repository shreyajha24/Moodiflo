import { api } from './api';
import type { DiscoveryResponse } from '../types';

export const homeService = {
  async getHomeFeed(): Promise<DiscoveryResponse> {
    const res = await api.get<DiscoveryResponse>('/api/home');
    return res.data;
  },
};
