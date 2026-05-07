import { http } from './http';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>('/api/n8n/webhook/auth/login', credentials);
    return response.data;
  }
};