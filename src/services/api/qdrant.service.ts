import { http } from './http';
import type { QdrantCollection, KnowledgePoint, KnowledgePointPayload } from '@/types/qdrant';
import { normalizeCollections, normalizePoints } from '@/utils/qdrant';

/**
 * Generate an embedding vector for the given text via OpenRouter.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await http.post<any>('/api/openrouter/embeddings', {
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data.data?.[0]?.embedding;
}

/**
 * Build bilingual text for embedding and pageContent.
 */
function getBilingualText(payload: KnowledgePointPayload): string {
  const src = payload.source_term || payload.text || '';
  const tgt = payload.target_term || '';
  if (src && tgt) return `${src} ${tgt}`;
  return src || tgt;
}

export const qdrantService = {
  fetchCollections: async (): Promise<QdrantCollection[]> => {
    const response = await http.get<any>('/api/qdrant/collections');
    const rawCollections = response.data?.result?.collections ?? response.data?.collections ?? [];
    const basic = normalizeCollections(rawCollections);

    // Fetch points count for each collection from detail endpoint
    const withCounts = await Promise.all(basic.map(async (col) => {
      try {
        const detailResp = await http.get<any>(`/api/qdrant/collections/${col.name}`);
        const detail = detailResp.data?.result;
        if (detail && typeof detail.points_count === 'number') {
          return { ...col, pointsCount: detail.points_count };
        }
      } catch (e) {
        // If detail endpoint fails, keep default count (0)
      }
      return col;
    }));

    return withCounts;
  },

  fetchPoints: async (collectionName: string): Promise<KnowledgePoint[]> => {
    const response = await http.post<any>(`/api/qdrant/collections/${collectionName}/points/scroll`, {
      limit: 10000,
      with_payload: true,
      with_vector: false
    });
    return normalizePoints(response.data.result?.points || []);
  },

  upsertPoint: async (collectionName: string, payload: KnowledgePointPayload): Promise<any> => {
    // Build bilingual text for embedding + pageContent
    const bilingualText = getBilingualText(payload);
    const sourceText = payload.source_term || payload.text || '';
    const targetText = payload.target_term || '';
    
    // Generate embedding from bilingual text (better semantic coverage)
    let vector: number[] | undefined;
    if (bilingualText) {
      vector = await generateEmbedding(bilingualText);
    }
    
    // Convert to pipeline-compatible format: pageContent + nested metadata
    const qdrantPayload: any = {
      pageContent: bilingualText,
      metadata: {
        lang_1: sourceText,
        lang_2: targetText,
        category: payload.context || payload.category || 'general',
        type: 'term'
      }
    };
    
    // Add optional fields
    if (payload.client) {
      qdrantPayload.metadata.client = payload.client;
    }
    if (payload.tags && payload.tags.length > 0) {
      qdrantPayload.metadata.tags = payload.tags;
    }
    if (payload.note) {
      qdrantPayload.metadata.note = payload.note;
    }
    
    const point: any = {
      id: Date.now(),
      payload: qdrantPayload
    };
    if (vector && vector.length > 0) {
      point.vector = vector;
    }
    
    const response = await http.put(`/api/qdrant/collections/${collectionName}/points`, {
      points: [point]
    });
    return response.data;
  },

  deletePoint: async (collectionName: string, id: string): Promise<any> => {
    // Qdrant is strict about ID types: UUID strings stay strings, integers must be numbers
    const idValue = /^\d+$/.test(id) ? parseInt(id, 10) : id;
    const response = await http.post(`/api/qdrant/collections/${collectionName}/points/delete`, {
      points: [idValue]
    });
    return response.data;
  },

  createCollection: async (name: string): Promise<any> => {
    const response = await http.put(`/api/qdrant/collections/${name}`, {
      vectors: {
        size: 1536,
        distance: 'Cosine'
      }
    });
    return response.data;
  }
};