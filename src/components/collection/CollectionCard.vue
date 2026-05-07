<template>
  <card class="collection-card">
    <template #content>
      <h3>{{ collection.name }}</h3>
      <p>This collection contains vector data.</p>
      <div class="card-actions">
        <button 
          @click="emit('open-collection', collection.name)" 
          class="open-btn"
        >
          Open Collection
        </button>
      </div>
    </template>
  </card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import type  { QdrantCollectionDescription } from '../../types/qdrant';

interface Props {
  collection: QdrantCollectionDescription;
}

const emit = defineEmits<{
  'open-collection': [collectionName: string];
}>();

defineProps<Props>();
</script>

<style scoped>
.collection-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.open-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.open-btn:hover {
  background-color: #2563eb;
}
</style>