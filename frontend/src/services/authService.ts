import { api } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, UserView } from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<UserView> {
    const res = await api.get<UserView>('/api/users/me');
    return res.data;
  },
};
