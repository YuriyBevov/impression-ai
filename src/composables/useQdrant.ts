import axios from 'axios';
import { ref } from 'vue';
import { handleApiError, QdrantError } from '../utils/errors';
import type  { QdrantCollectionDescription, QdrantPoint, ScrollPointsRequest } from '../types/qdrant';

const API_BASE_URL = '/api/qdrant';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useQdrant() {
  const loading = ref(false);
  const error = ref<QdrantError | null>(null);

  const getCollections = async (): Promise<QdrantCollectionDescription[]> => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await apiClient.get('/collections');
      return response.data.result.collections as QdrantCollectionDescription[];
    } catch (err) {
      error.value = handleApiError(err);
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const scrollPoints = async (
    collectionName: string,
    request: ScrollPointsRequest
  ): Promise<{ points: QdrantPoint[]; next_page_offset: string | null }> => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await apiClient.post(`/collections/${collectionName}/points/scroll`, request);
      return {
        points: response.data.result.points,
        next_page_offset: response.data.result.next_page_offset
      };
    } catch (err) {
      error.value = handleApiError(err);
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const upsertPoints = async (
    collectionName: string,
    points: QdrantPoint[]
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      
      await apiClient.put(`/collections/${collectionName}/points?wait=true`, { points });
    } catch (err) {
      error.value = handleApiError(err);
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const deletePoints = async (
    collectionName: string,
    pointIds: string[]
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      
      await apiClient.post(`/collections/${collectionName}/points/delete`, { points: pointIds });
    } catch (err) {
      error.value = handleApiError(err);
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getCollections,
    scrollPoints,
    upsertPoints,
    deletePoints,
  };
}