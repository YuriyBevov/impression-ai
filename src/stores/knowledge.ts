import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { QdrantCollection, KnowledgePoint, KnowledgePointPayload } from '@/types/qdrant';
import { qdrantService } from '@/services/api/qdrant.service';

export const useKnowledgeStore = defineStore('knowledge', () => {
  const collections = ref<QdrantCollection[]>([]);
  const selectedCollection = ref<string | null>(null);
  const points = ref<KnowledgePoint[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchCollections = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      collections.value = await qdrantService.fetchCollections();
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки коллекций';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPoints = async (collectionName: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      points.value = await qdrantService.fetchPoints(collectionName);
      selectedCollection.value = collectionName;
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки терминов';
    } finally {
      isLoading.value = false;
    }
  };

  const createPoint = async (collectionName: string, payload: KnowledgePointPayload): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await qdrantService.upsertPoint(collectionName, payload);
      // Refresh the points list
      await fetchPoints(collectionName);
    } catch (err: any) {
      error.value = err.message || 'Ошибка сохранения термина';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updatePoint = async (collectionName: string, id: string, payload: KnowledgePointPayload): Promise<void> => {
    // For update we'll delete the old point and create a new one since QDrant doesn't have a direct update endpoint
    await deletePoint(collectionName, id);
    await createPoint(collectionName, {...payload});
  };

  const deletePoint = async (collectionName: string, id: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await qdrantService.deletePoint(collectionName, id);
      // Remove from local array
      points.value = points.value.filter(point => point.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Ошибка удаления термина';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    collections,
    selectedCollection,
    points,
    isLoading,
    error,
    fetchCollections,
    fetchPoints,
    createPoint,
    updatePoint,
    deletePoint
  };
});