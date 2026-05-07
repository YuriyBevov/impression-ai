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
 * Determine which payload field to use for embedding.
 */
function getEmbeddingText(payload: KnowledgePointPayload): string {
  return payload.source_term || payload.text || '';
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
    // Generate embedding for the source text
    const embedText = getEmbeddingText(payload);
    let vector: number[] | undefined;
    if (embedText) {
      vector = await generateEmbedding(embedText);
    }
    
    const point: any = {
      id: Date.now(),
      payload
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