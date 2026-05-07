<template>
  <div class="knowledge-collection">
    <!-- Page Title with Back Button -->
    <div class="collection-header">
      <Button 
        icon="pi pi-chevron-left" 
        label="Назад к списку"
        @click="$router.push('/knowledge')"
        severity="secondary"
        class="mb-4"
      />
      <PageTitle :title="`Коллекция: ${collectionName}`">
        <template #actions>
          <Button 
            label="Добавить запись" 
            icon="pi pi-plus" 
            @click="showAddDialog = true"
          />
        </template>
      </PageTitle>
    </div>
    
    <!-- Error State -->
    <ErrorState 
      v-if="knowledgeStore.error" 
      :message="knowledgeStore.error" 
      @retry="loadPoints"
    />
    
    <!-- Points Table -->
    <CollectionPointsTable 
      v-if="!knowledgeStore.error"
      :points="knowledgeStore.points"
      :collection-type="collectionType"
      @edit-point="handleEditPoint"
      @delete-point="handleDeletePoint"
    />

    <!-- Knowledge Point Dialog -->
    <KnowledgePointDialog
      :visible="showAddDialog || !!editingPoint"
      :point="editingPoint?.payload || undefined"
      :collection-type="collectionType"
      @save="handleSavePoint"
      @close="handleCloseDialog"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useKnowledgeStore } from '@/stores/knowledge';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { KnowledgePointPayload } from '@/types/qdrant';
import { getCollectionType } from '@/utils/qdrant';
import PageTitle from '@/components/common/PageTitle.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import CollectionPointsTable from '@/components/knowledge/CollectionPointsTable.vue';
import KnowledgePointDialog from '@/components/knowledge/KnowledgePointDialog.vue';

const route = useRoute();
const knowledgeStore = useKnowledgeStore();
const confirm = useConfirm();
const toast = useToast();

// Extract collection name from route params
const collectionName = route.params.collectionName as string;
const collectionType = computed(() => getCollectionType(collectionName));

// State for dialogs
const showAddDialog = ref(false);
const editingPoint = ref<{ id: string; payload: KnowledgePointPayload } | null>(null);

const handleEditPoint = (point: any) => {
  editingPoint.value = { id: point.id, payload: point.payload };
};

const handleDeletePoint = (point: any) => {
  confirm.require({
    message: `Вы уверены, что хотите удалить запись "${point.payload.source_term}"?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await knowledgeStore.deletePoint(collectionName, point.id);
        toast.add({ severity: 'success', summary: 'Успех', detail: 'Запись успешно удалена', life: 3000 });
      } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Произошла ошибка при удалении записи', life: 4000 });
      }
    }
  });
};

const handleSavePoint = async (payload: KnowledgePointPayload) => {
  try {
    if (editingPoint.value) {
      await knowledgeStore.updatePoint(collectionName, editingPoint.value.id, payload);
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Запись успешно обновлена', life: 3000 });
    } else {
      await knowledgeStore.createPoint(collectionName, payload);
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Запись успешно создана', life: 3000 });
    }
    handleCloseDialog();
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Произошла ошибка при сохранении записи', life: 4000 });
  }
};

const handleCloseDialog = () => {
  showAddDialog.value = false;
  editingPoint.value = null;
};

const loadPoints = () => {
  knowledgeStore.fetchPoints(collectionName);
};

onMounted(() => {
  loadPoints();
});
</script>

<style scoped>
.knowledge-collection {
  width: 100%;
}

.collection-header {
  margin-bottom: 20px;
}
</style>
