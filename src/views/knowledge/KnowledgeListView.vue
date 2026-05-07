<template>
  <div class="knowledge-list">
    <!-- Page Title with actions -->
    <PageTitle title="База знаний">
      <template #actions>
        <Button
          label="Создать новую коллекцию"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
        />
      </template>
    </PageTitle>
    
    <!-- Error State -->
    <ErrorState 
      v-if="knowledgeStore.error" 
      :message="knowledgeStore.error" 
      @retry="loadCollections"
    />
    
    <!-- Collections Table -->
    <KnowledgeCollectionsTable 
      v-if="!knowledgeStore.error"
      :collections="knowledgeStore.collections"
      @select-collection="selectCollection"
    />

    <!-- Create Collection Dialog -->
    <CreateCollectionDialog
      :visible="showCreateDialog"
      :existing-collections="collectionNames"
      @close="showCreateDialog = false"
      @created="onCollectionCreated"
    />
  </div>
</template>

<style scoped>
.knowledge-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useKnowledgeStore } from '@/stores/knowledge';
import PageTitle from '@/components/common/PageTitle.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import KnowledgeCollectionsTable from '@/components/knowledge/KnowledgeCollectionsTable.vue';
import CreateCollectionDialog from '@/components/knowledge/CreateCollectionDialog.vue';

const knowledgeStore = useKnowledgeStore();
const router = useRouter();

const showCreateDialog = ref(false);

const collectionNames = computed(() =>
  knowledgeStore.collections.map(c => c.name)
);

const selectCollection = (collectionName: string) => {
  router.push({ name: 'KnowledgeCollection', params: { collectionName } });
};

const loadCollections = () => {
  knowledgeStore.fetchCollections();
};

const onCollectionCreated = () => {
  showCreateDialog.value = false;
  loadCollections();
};

onMounted(() => {
  loadCollections();
});
</script>