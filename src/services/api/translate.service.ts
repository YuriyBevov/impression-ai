import { http } from './http';
import type { TranslateRequest, TranslateResponse, TranslationHistoryItem } from '@/types/translation';

interface TranslationStartResponse {
  id: string;
  status: string;
}

interface TranslationStatusResponse {
  id: string;
  status: string;
  result?: TranslateResponse;
  error?: string;
}

export const translateService = {
  startTranslation: async (request: TranslateRequest): Promise<string> => {
    const response = await http.post<TranslationStartResponse>('/api/translate/start', request);
    return response.data.id;
  },

  getStatus: async (id: string): Promise<TranslationStatusResponse> => {
    const response = await http.get<TranslationStatusResponse>(`/api/translate/status/${id}`);
    return response.data;
  },

  pollUntilDone: async (id: string, intervalMs = 3000, timeoutMs = 600000): Promise<TranslateResponse> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const status = await translateService.getStatus(id);

      if (status.status === 'completed' && status.result) {
        return status.result;
      }

      if (status.status === 'error') {
        throw new Error(status.error || 'Ошибка перевода');
      }

      // Still processing — wait
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Превышено время ожидания перевода');
  },

  fetchHistory: async (clientId?: string): Promise<TranslationHistoryItem[]> => {
    try {
      let url = '/api/translate/history';
      if (clientId) {
        url += `?client_id=${clientId}`;
      }
      const response = await http.get<TranslationHistoryItem[]>(url);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch history:', error);
      return [];
    }
  },

  getHistoryItem: async (id: string): Promise<TranslationHistoryItem> => {
    const response = await http.get<TranslationHistoryItem>(`/api/translate/history/${id}`);
    return response.data;
  }
};
