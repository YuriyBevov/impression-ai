<template>
  <div class="dashboard">
    <h1>Qdrant Collections Dashboard</h1>
    
    <div v-if="collectionsStore.loading" class="loading">
      Loading collections...
    </div>
    
    <div v-else-if="collectionsStore.error" class="error">
      Error: {{ collectionsStore.error }}
    </div>
    
    <template v-else>
      <div v-if="collectionsStore.items.length > 0" class="collections-grid">
        <collection-card 
          v-for="collection in collectionsStore.items" 
          :key="collection.name"
          :collection="collection"
          @open-collection="navigateToCollection"
        />
      </div>
      
      <div v-else class="no-collections">
        No collections found
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCollectionsStore } from '../stores/collections';
import CollectionCard from '../components/collection/CollectionCard.vue';

const router = useRouter();
const collectionsStore = useCollectionsStore();

const navigateToCollection = (collectionName: string) => {
  router.push(`/collection/${collectionName}`);
};

onMounted(() => {
  collectionsStore.fetchCollections();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.loading, .error, .no-collections {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}
</style>