<template>
  <div class="collection-view">
    <div class="view-header">
      <h1>Collection: {{ collectionName }}</h1>
    </div>
    
    <div class="controls">
      <div class="search-bar">
        <icon-field>
          <input-icon><i class="pi pi-search" /></input-icon>
          <input-text 
            v-model="pointsStore.search" 
            placeholder="Search in all fields..."
            class="search-input"
          />
        </icon-field>
      </div>
      
      <multi-select 
        v-if="pointsStore.availableTopics.length > 0"
        v-model="pointsStore.selectedTopics" 
        :options="pointsStore.availableTopics" 
        placeholder="Filter by topics"
        class="topics-filter"
      >
        <template #option="slotProps">
          <div>{{ slotProps.option }}</div>
        </template>
      </multi-select>
      
      <button 
        @click="showAddDialog = true"
        label="Add Point"
        icon="pi pi-plus"
        class="add-point-btn"
      >
        Add Point
      </button>
    </div>
    
    <div v-if="pointsStore.loading" class="loading">
      Loading points...
    </div>
    
    <div v-else-if="pointsStore.error" class="error">
      Error: {{ pointsStore.error }}
    </div>
    
    <div v-else class="table-container">
      <collection-table 
        :points="pointsStore.filteredItems"
        @edit-point="handleEditPoint"
        @delete-point="handleDeletePoint"
      />
    </div>
    
    <point-form-dialog 
      :visible="showAddDialog || !!editingPoint"
      :point="editingPoint || undefined"
      :collection-name="collectionName"
      @save="handleSavePoint"
      @close="handleCloseDialog"
    />
  </div>
  <confirm-dialog />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePointsStore } from '../stores/points';
import CollectionTable from '../components/collection/CollectionTable.vue';
import PointFormDialog from '../components/collection/PointFormDialog.vue';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import type  { QdrantPoint } from '../types/qdrant';

const route = useRoute();
const pointsStore = usePointsStore();

// Extract collection name from route params
const collectionName = route.params.collectionName as string;

// Confirmation dialog functionality
const confirm = useConfirm();

// State for dialogs
const showAddDialog = ref(false);
const editingPoint = ref<QdrantPoint | null>(null);

const handleEditPoint = (point: QdrantPoint) => {
  editingPoint.value = point;
};

const handleDeletePoint = (point: QdrantPoint) => {
  confirm.require({
    message: `Are you sure you want to delete point ${point.id}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await pointsStore.deletePoint(collectionName, point.id as string);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  });
};

const handleSavePoint = async (point: QdrantPoint) => {
  try {
    await pointsStore.savePoint(collectionName, point);
    handleCloseDialog();
  } catch (err) {
    console.error("Save failed:", err);
  }
};

const handleCloseDialog = () => {
  showAddDialog.value = false;
  editingPoint.value = null;
};

onMounted(() => {
  pointsStore.fetchPoints(collectionName);
});
</script>

<style scoped>
.collection-view {
  width: 100%;
}

.view-header {
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  min-width: 250px;
}

.topics-filter {
  min-width: 200px;
}

.table-container {
  width: 100%;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}
</style>