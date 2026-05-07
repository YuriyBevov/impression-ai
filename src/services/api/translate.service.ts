import { http } from './http';
import type { TranslateRequest, TranslateResponse, TranslationHistoryItem } from '@/types/translation';

export const translateService = {
  translate: async (request: TranslateRequest): Promise<TranslateResponse> => {
    const response = await http.post<TranslateResponse>('/api/n8n/webhook/translate', request);
    return response.data;
  },

  fetchHistory: async (clientId?: string): Promise<TranslationHistoryItem[]> => {
    try {
      let url = '/api/n8n/webhook/translations';
      if (clientId) {
        url += `?client_id=${clientId}`;
      }
      const response = await http.get<TranslationHistoryItem[]>(url);
      return response.data;
    } catch (error) {
      console.warn('Translations endpoint unavailable (502 expected - no webhook yet)');
      return [];
    }
  }
};