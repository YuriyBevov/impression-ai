<template>
  <Dialog
    v-model:visible="displayDialog"
    :modal="true"
    :closable="true"
    :style="{ width: '600px' }"
    @hide="onHide"
  >
    <template #header>
      <h3>{{ editing ? 'Редактировать точку' : 'Добавить точку' }}</h3>
    </template>
    
    <div class="form-container">
      <div class="grid">
        <!-- Source term (textarea) -->
        <div class="col-12 field-container">
          <label for="source_term">Исходный термин</label>
          <Textarea
            id="source_term"
            v-model="currentPoint.payload.source_term"
            :auto-resize="true"
            rows="3"
            class="w-full"
            placeholder="Введите исходный термин..."
          />
        </div>
        
        <!-- Target term (textarea) -->
        <div class="col-12 field-container">
          <label for="target_term">Переведенный термин</label>
          <Textarea
            id="target_term"
            v-model="currentPoint.payload.target_term"
            :auto-resize="true"
            rows="3"
            class="w-full"
            placeholder="Введите перевод..."
          />
        </div>
        
        <!-- Context (textarea) -->
        <div class="col-12 field-container">
          <label for="category">Категория</label>
          <Select
            id="category"
            v-model="currentPoint.payload.context"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            placeholder="Выберите категорию"
            class="w-full"
          />
        </div>
        
        <!-- Notes (textarea) -->
        <div class="col-6 field-container">
          <label for="notes">Примечания</label>
          <small class="field-hint">Грамматические особенности, исключения, примечания переводчика</small>
          <Textarea
            id="notes"
            v-model="currentPoint.payload.notes"
            :auto-resize="true"
            rows="3"
            class="w-full"
            placeholder="Дополнительные заметки..."
          />
        </div>
        
        <!-- Source lang -->
        <div class="col-6 field-container">
          <label for="source_lang">Язык источника</label>
          <InputText
            id="source_lang"
            v-model="currentPoint.payload.source_lang"
            class="w-full"
            placeholder="en, ru, de..."
          />
        </div>
        
        <!-- Target lang -->
        <div class="col-6 field-container">
          <label for="target_lang">Язык перевода</label>
          <InputText
            id="target_lang"
            v-model="currentPoint.payload.target_lang"
            class="w-full"
            placeholder="ru, en, de..."
          />
        </div>
        
        <!-- Tags -->
        <div class="col-12 field-container">
          <label for="tags">Теги</label>
          <small class="field-hint">Категории для группировки терминов (IT, Медицина, Юриспруденция...)</small>
          <InputText
            id="tags"
            v-model="tagsText"
            class="w-full"
            placeholder="IT, Медицина, Маркетинг... (через запятую)"
            @update:model-value="parseTags"
          />
        </div>
      </div>
      
      <dynamic-fields
        v-if="extraFields.length > 0"
        :fields="extraFields"
        v-model="currentPoint.payload" 
        @field-added="onFieldAdded"
        @field-removed="onFieldRemoved"
      />
    </div>
    
    <template #footer>
      <Button 
        @click="savePoint" 
        label="Сохранить"
        icon="pi pi-check"
        severity="success"
      />
      <Button 
        @click="cancel"
        label="Отмена"
        icon="pi pi-times"
        severity="secondary"
        class="p-button-outlined"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type  { QdrantPoint } from '../../types/qdrant';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import DynamicFields from './DynamicFields.vue';
import Button from 'primevue/button';
import type { FieldDefinition } from './DynamicFields.vue';

interface Props {
  visible: boolean;
  point?: QdrantPoint;
  collectionName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'save': [point: QdrantPoint];
  'close': [];
}>();

const displayDialog = ref(false);

const currentPoint = ref<Omit<QdrantPoint, 'vector'> & { id: string }>({
  id: crypto.randomUUID(),
  payload: {}
});

const editing = computed(() => !!props.point);

// Category options for context field
const categoryOptions = [
  { label: 'Юридический перевод', value: 'legal' }
];

// Tags as comma-separated string for input
const tagsText = ref('');

// Initialize tagsText from payload when editing
const parseTags = (val?: string) => {
  if (!val || !val.trim()) {
    currentPoint.value.payload.tags = [];
    return;
  }
  currentPoint.value.payload.tags = val.split(',').map(t => t.trim()).filter(Boolean);
};

// Extra fields not in glossary standard fields
const glossaryFields = ['source_term', 'target_term', 'context', 'notes', 'source_lang', 'target_lang', 'tags'];

const extraFields = computed<FieldDefinition[]>(() => {
  if (!currentPoint.value.payload) return [];
  const keys = Object.keys(currentPoint.value.payload);
  const extra = keys.filter(k => !glossaryFields.includes(k));
  
  return extra.map(key => ({
    key,
    label: capitalize(key),
    type: detectFieldType(currentPoint.value.payload[key]),
    section: 'Extra Fields',
    value: currentPoint.value.payload[key]
  }));
});

watch(
  () => props.visible,
  (newVal) => {
    displayDialog.value = newVal;
    if (newVal) {
      if (props.point) {
        const payload = { ...props.point.payload };
        currentPoint.value = {
          id: props.point.id as string,
          payload
        };
        // Initialize tagsText from existing tags array
        if (Array.isArray(payload.tags)) {
          tagsText.value = payload.tags.join(', ');
        } else {
          tagsText.value = '';
        }
      } else {
        currentPoint.value = {
          id: crypto.randomUUID(),
          payload: {}
        };
        tagsText.value = '';
      }
    }
  }
);

const detectFieldType = (value: any): string => {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'checkbox';
  if (typeof value === 'string' && (value.includes('\n') || value.length > 100)) return 'textarea';
  if (Array.isArray(value)) return 'array';
  if (value && typeof value === 'object') return 'object';
  return 'text';
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const savePoint = () => {
  emit('save', currentPoint.value as QdrantPoint);
};

const cancel = () => {
  emit('close');
};

const onHide = () => {
  emit('close');
};

const onFieldAdded = (field: FieldDefinition) => {
  if (!currentPoint.value.payload[field.key]) {
    currentPoint.value.payload[field.key] = field.value || '';
  }
};

const onFieldRemoved = (fieldKey: string) => {
  if (currentPoint.value.payload) {
    delete currentPoint.value.payload[fieldKey];
  }
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.field-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.field-container label {
  font-weight: bold;
  margin-bottom: 2px;
}

.field-hint {
  color: var(--text-color-secondary);
  font-size: 0.85em;
  margin-bottom: 4px;
}
</style>
