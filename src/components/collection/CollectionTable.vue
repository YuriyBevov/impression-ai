<template>
  <div class="table-wrapper">
    <p-data-table 
      :value="points" 
      tableStyle="width: 100%"
      stripedRows
      rowKey="id"
    >
      <!-- Dynamic columns based on point payload -->
      <template v-for="column in dynamicColumns" :key="column.field">
        <p-column 
          :field="column.field" 
          :header="column.header"
          :body="renderCellContent(column)"
        ></p-column>
      </template>
      
      <!-- Actions column -->
      <p-column header="Actions" headerStyle="width: 120px">
        <template #body="slotProps">
          <div class="actions-cell">
            <button
              icon="pi pi-pencil"
              severity="secondary"
              @click="$emit('edit-point', slotProps.data)"
              text
              rounded
              class="action-button edit-button"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              icon="pi pi-trash"
              severity="danger"
              @click="$emit('delete-point', slotProps.data)"
              text
              rounded
              class="action-button delete-button"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </template>
      </p-column>
    </p-data-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type  { QdrantPoint, DynamicColumn } from '../../types/qdrant';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

interface Props {
  points: QdrantPoint[];
}

const props = defineProps<Props>();

// Define emit for events
const emit = defineEmits<{
  'edit-point': [point: QdrantPoint];
  'delete-point': [point: QdrantPoint];
}>();

// Generate dynamic columns based on the payload structure of the points
const dynamicColumns = computed<DynamicColumn[]>(() => {
  if (!props.points || props.points.length === 0) {
    return [
      { field: 'id', header: 'ID' },
      { field: 'payload', header: 'Payload' }
    ];
  }

  // Use the first point to determine the structure
  const firstPoint = props.points[0];
  const columns: DynamicColumn[] = [];
  
  // Always add ID field
  columns.push({ field: 'id', header: 'ID' });
  
  // Add special handling for known fields in payload
  if (firstPoint.payload && typeof firstPoint.payload === 'object') {
    const payloadKeys = Object.keys(firstPoint.payload);
    
    // Process in special order: text, translation.*, topics, then others
    // Add text field first if it exists
    if (payloadKeys.includes('text')) {
      columns.push({ field: 'payload.text', header: 'Text' });
    }

    // Process translations fields and expand them by language
    const translationFields = payloadKeys.filter(key => key.startsWith('translations'));
    if (translationFields.length > 0) {
      // Get languages from the first available translation object
      if (firstPoint.payload.translations && typeof firstPoint.payload.translations === 'object') {
        const languages = Object.keys(firstPoint.payload.translations);
        languages.forEach(lang => {
          columns.push({
            field: `payload.translations.${lang}`,
            header: `Translation (${lang})`
          });
        });
      }
    }

    // Add topics if it exists
    if (payloadKeys.includes('topics')) {
      columns.push({ field: 'payload.topics', header: 'Topics' });
    }

    // Add remaining fields
    const standardFields = ['text', 'topics', ...translationFields];
    const remainingFields = payloadKeys.filter(key => !standardFields.includes(key));
    
    remainingFields.forEach(key => {
      columns.push({
        field: `payload.${key}`,
        header: capitalize(key),
        dataType: detectDataType(firstPoint.payload[key])
      });
    });
  }
  
  return columns;
});

// Render function to convert dot notation and handle special cases
const renderCellContent = (column: DynamicColumn) => {
  return (rowData: any) => {
    // Handle dot notation paths
    const pathParts = column.field.split('.');
    let value = pathParts.reduce((acc: any, part: string) => acc && acc[part], rowData);
    
    // Special formatting for arrays (like topics)
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    // Special formatting for objects
    if (value && typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    
    return value;
  };
};

// Helper function to detect data type for formatting purposes
const detectDataType = (value: any): DynamicColumn['dataType'] => {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (value && typeof value === 'object') return 'object';
  return 'text';
};

// Helper function to capitalize strings
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.action-button {
  padding: 0.5rem;
}

.edit-button:hover {
  color: var(--primary-color);
}

.delete-button:hover {
  color: var(--red-500);
}
</style>