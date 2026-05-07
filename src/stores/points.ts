import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useQdrant } from '../composables/useQdrant';
import type { QdrantPoint } from '../types/qdrant';

export const usePointsStore = defineStore('points', () => {
  const items = ref<QdrantPoint[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const search = ref('');
  const selectedTopics = ref<string[]>([]);

  const { 
    scrollPoints: apiScrollPoints, 
    upsertPoints: apiUpsertPoints, 
    deletePoints: apiDeletePoints 
  } = useQdrant();

  // Filter points based on search and topic filters
  const filteredItems = computed(() => {
    return items.value.filter(point => {
      // Apply search filter - look for search term in all payload values
      const matchesSearch = !search.value || 
        Object.values(point.payload).some(value => 
          String(value).toLowerCase().includes(search.value.toLowerCase())
        );

      // Apply topic filter if topics are selected
      let matchesTopics = true;
      if (selectedTopics.value.length > 0) {
        const pointTopics = point.payload.topics || [];
        // If payload.topics exists, it's usually an array of strings
        if (Array.isArray(pointTopics)) {
          matchesTopics = pointTopics.some((topic: string) => 
            selectedTopics.value.includes(topic)
          );
        } else {
          // If not an array, check if single topic matches
          matchesTopics = selectedTopics.value.includes(String(pointTopics));
        }
      }

      return matchesSearch && matchesTopics;
    });
  });

  // Extract all available topics across all points
  const availableTopics = computed(() => {
    const allTopics = new Set<string>();
    items.value.forEach(point => {
      const topics = point.payload.topics;
      if (topics) {
        if (Array.isArray(topics)) {
          topics.forEach((topic: string) => allTopics.add(topic));
        } else {
          // For single topic
          allTopics.add(String(topics));
        }
      }
    });
    return Array.from(allTopics).sort();
  });

  // Extract all available languages from translations
  const availableLanguages = computed(() => {
    const languages = new Set<string>();
    items.value.forEach(point => {
      const translations = point.payload.translations;
      if (translations && typeof translations === 'object') {
        Object.keys(translations).forEach(lang => languages.add(lang));
      }
    });
    return Array.from(languages).sort();
  });

  const fetchPoints = async (collectionName: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Reset filters when fetching new collection
      search.value = '';
      selectedTopics.value = [];
      
      const { points } = await apiScrollPoints(collectionName, {
        limit: 100,
        with_payload: true,
        with_vector: false
      });
      
      items.value = points;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch points';
    } finally {
      loading.value = false;
    }
  };

  const savePoint = async (collectionName: string, point: QdrantPoint) => {
    try {
      loading.value = true;
      error.value = null;
      
      await apiUpsertPoints(collectionName, [point]);
      
      // If the point ID already exists in our local items, replace it; otherwise add it
      const existingIndex = items.value.findIndex(item => item.id === point.id);
      if (existingIndex !== -1) {
        items.value[existingIndex] = point;
      } else {
        items.value.push(point);
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save point';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePoint = async (collectionName: string, pointId: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      await apiDeletePoints(collectionName, [pointId]);
      
      // Remove from local items
      items.value = items.value.filter(point => point.id !== pointId);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete point';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    search,
    selectedTopics,
    filteredItems,
    availableTopics,
    availableLanguages,
    fetchPoints,
    savePoint,
    deletePoint,
  };
});