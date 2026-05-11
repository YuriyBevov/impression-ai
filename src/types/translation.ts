export type LanguageCode = 'ru' | 'en';

export interface TranslateRequest {
  client_id: string;
  client_name: string;
  source_text: string;
  translation_pair: string;
  source_lang?: LanguageCode;
  target_lang?: LanguageCode;
  // document?: File;
}

export interface TranslateResponse {
  client_name: string;
  source_text: string;
  translated_text: string;
  status: string;
  model: string;
  cost: number;
  tokens: number;
  processing_time: number;
}

export interface TranslationHistoryItem {
  id: string;
  date: string;
  client_id: string;
  client_name: string;
  source_lang: string;
  target_lang: string;
  source_text: string;
  translated_text: string;
  status?: string;
  model: string;
  cost: number;
  tokens: number;
  translation_pair?: string;
  processing_time?: number;
}
