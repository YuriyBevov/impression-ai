import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQdrant } from '../composables/useQdrant';
import type  { QdrantCollectionDescription } from '../types/qdrant';

export const useCollectionsStore = defineStore('collections', () => {
  const items = ref<QdrantCollectionDescription[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { getCollections: apiGetCollections } = useQdrant();

  const fetchCollections = async () => {
    try {
      loading.value = true;
      error.value = null;
      const collections = await apiGetCollections();
      items.value = collections;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch collections';
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    fetchCollections,
  };
});