export type CollectionType = 'glossary' | 'example' | 'client' | 'unknown';

export interface QdrantCollection {
  name: string;
  pointsCount: number;
  type: CollectionType;
}

export interface KnowledgePointPayload {
  source_term?: string;
  target_term?: string;
  text?: string;
  pageContent?: string;
  category?: string;
  context?: string;
  note?: string;
  tags?: string[];
  source_lang?: string;
  target_lang?: string;
  client?: string;
}

export interface KnowledgePoint {
  id: string;
  payload: KnowledgePointPayload;
}