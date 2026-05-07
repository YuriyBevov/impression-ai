import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { getToken, removeToken } from '@/utils/storage';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add request interceptor to inject token
httpClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Чистим токен ТОЛЬКО если 401 пришёл от нашего auth endpoint
      const requestUrl = error.config?.url || '';
      if (requestUrl.includes('/api/n8n/webhook/auth/')) {
        const authStore = useAuthStore();
        authStore.logout();
        removeToken();
      }
      // Для других 401 (OpenRouter, n8n webhooks) — не трогаем сессию
    }
    return Promise.reject(error);
  }
);

export const http = {
  get: <T>(url: string): Promise<AxiosResponse<T>> => {
    return httpClient.get<T>(url);
  },

  post: <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return httpClient.post<T>(url, data);
  },

  put: <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return httpClient.put<T>(url, data);
  },

  patch: <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    return httpClient.patch<T>(url, data);
  },

  delete: <T>(url: string): Promise<AxiosResponse<T>> => {
    return httpClient.delete<T>(url);
  }
};

export default httpClient;