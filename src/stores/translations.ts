import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TranslateRequest, TranslateResponse, TranslationHistoryItem } from '@/types/translation';
import { translateService } from '@/services/api/translate.service';

export const useTranslationsStore = defineStore('translations', () => {
  const currentResult = ref<TranslateResponse | null>(null);
  const history = ref<TranslationHistoryItem[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const translate = async (request: TranslateRequest): Promise<TranslateResponse> => {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. Start translation — get ID immediately
      const id = await translateService.startTranslation(request);

      // 2. Poll until n8n finishes
      const result = await translateService.pollUntilDone(id);

      currentResult.value = result;

      // Add to history
      const [sourceLang, targetLang] = request.translation_pair.split('-') as [string, string];
      history.value.unshift({
        ...result,
        source_text: request.source_text,
        client_id: request.client_id,
        client_name: request.client_name,
        source_lang: request.source_lang ?? sourceLang ?? 'ru',
        target_lang: request.target_lang ?? targetLang ?? 'en',
        date: new Date().toISOString(),
        id: Date.now().toString()
      });

      return result;
    } catch (err: any) {
      error.value = err.message || 'Ошибка перевода';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchHistory = async (clientId?: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const historyData = await translateService.fetchHistory(clientId);
      history.value = historyData;
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки истории';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    currentResult,
    history,
    isLoading,
    error,
    translate,
    fetchHistory
  };
});
