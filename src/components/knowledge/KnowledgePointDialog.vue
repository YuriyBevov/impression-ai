<template>
  <Dialog 
    v-model:visible="displayDialog" 
    :header="isEditing ? 'Редактировать запись' : 'Добавить запись'" 
    :modal="true" 
    :closable="true"
    :style="{ width: '700px' }"
    @hide="resetForm"
  >
    <div class="flex gap-4">
      <!-- Left column -->
      <div class="flex flex-column flex-1 gap-2">
        <div class="field">
          <label for="source_term" class="block mb-2">Исходный термин *</label>
          <Textarea 
            id="source_term" 
            v-model="formData.source_term" 
            :autoResize="true"
            rows="3"
            placeholder="Введите исходный термин"
            :class="['w-full', { 'p-invalid': errors.source_term }]"
          />
          <small v-if="errors.source_term" class="p-error">{{ errors.source_term }}</small>
        </div>

        <div class="field">
          <label for="category" class="block mb-2">Категория</label>
          <Select
            id="category"
            v-model="formData.context"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            placeholder="Выберите категорию"
            class="w-full"
          />
        </div>

        <!-- Client field — only for clients collections -->
        <div v-if="collectionType === 'client'" class="field">
          <label for="client" class="block mb-2">Клиент</label>
          <Select
            id="client"
            v-model="formData.client"
            :options="clientOptions"
            option-label="label"
            option-value="value"
            placeholder="Выберите клиента"
            class="w-full"
          />
        </div>
      </div>

      <!-- Right column -->
      <div class="flex flex-column flex-1 gap-2">
        <div class="field">
          <label for="target_term" class="block mb-2">Переведенный термин</label>
          <Textarea 
            id="target_term" 
            v-model="formData.target_term" 
            :autoResize="true"
            rows="3"
            placeholder="Введите перевод"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="tags" class="block mb-2">Теги</label>
          <InputText 
            id="tags" 
            v-model="tagsInput" 
            type="text" 
            placeholder="Добавьте теги, разделенные запятой"
            class="w-full"
            @blur="updateTags"
          />
          <small>Введите теги, разделенные запятой</small>
        </div>

        <div class="field">
          <label for="note" class="block mb-2">Исключения</label>
          <Textarea 
            id="note" 
            v-model="formData.note" 
            :autoResize="true"
            rows="3"
            placeholder="Исключения из правил перевода"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button 
        label="Отмена" 
        icon="pi pi-times" 
        @click="cancel"
        text 
        severity="secondary"
      />
      <Button 
        :label="isEditing ? 'Сохранить' : 'Создать'" 
        icon="pi pi-check" 
        @click="save"
        :loading="saving"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { KnowledgePointPayload } from '@/types/qdrant';
import { required } from '@/utils/validators';

interface DialogProps {
  visible: boolean;
  point?: KnowledgePointPayload;
}

interface Errors {
  source_term?: string;
}

const props = withDefaults(defineProps<DialogProps>(), {
  point: undefined
});

const route = useRoute();
const collectionName = computed(() => route.params.collectionName as string || '');
const collectionType = computed(() => {
  const name = collectionName.value.toLowerCase();
  if (name.includes('client')) return 'client';
  if (name.includes('glossary')) return 'glossary';
  return 'unknown';
});

const emit = defineEmits<{
  save: [payload: KnowledgePointPayload];
  close: [];
}>();

const formData = ref<KnowledgePointPayload>({
  source_term: '',
  target_term: '',
  context: '',
  note: '',
  tags: []
});

// Category options
const categoryOptions = [
  { label: 'Юридический перевод', value: 'Юридический перевод' }
];

const tagsInput = ref('');
const saving = ref(false);
const errors = ref<Errors>({});
const displayDialog = computed({
  get: () => props.visible,
  set: (value: boolean) => !value && cancel()
});

const isEditing = computed(() => !!props.point);

// Fetch clients for the dropdown
const clientOptions = ref<{ label: string; value: string }[]>([]);

const fetchClients = async () => {
  try {
    const res = await fetch('/api/n8n/webhook/clients');
    const clients = await res.json();
    clientOptions.value = (clients || []).map((c: any) => ({
      label: c.name,
      value: c.name
    }));
  } catch {
    clientOptions.value = [];
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && collectionType.value === 'client') {
      fetchClients();
    }
    if (newVal && props.point) {
      // Editing existing point — convert old values
      const point = { ...props.point };
      // Convert 'legal'/'law' → 'Юридический перевод'
      if (point.context === 'legal' || point.context === 'law') {
        point.context = 'Юридический перевод';
      }
      formData.value = point;
      tagsInput.value = formData.value.tags?.join(', ') || '';
    } else if (newVal && !props.point) {
      // Creating new point - reset form
      resetForm();
    }
  }
);

const updateTags = () => {
  if (tagsInput.value) {
    formData.value.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
  } else {
    formData.value.tags = [];
  }
};

const resetForm = () => {
  formData.value = {
    source_term: '',
    target_term: '',
    context: '',
    note: '',
    tags: [],
    client: ''
  };
  tagsInput.value = '';
  errors.value = {};
};

const validate = (): boolean => {
  errors.value = {};
  
  const sourceTermError = required(formData.value.source_term);
  if (sourceTermError !== true) {
    errors.value.source_term = sourceTermError;
  }
  
  return Object.keys(errors.value).length === 0;
};

const save = async () => {
  updateTags();

  if (!validate()) {
    return;
  }

  saving.value = true;
  try {
    emit('save', { ...formData.value });
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  resetForm();
  emit('close');
};
</script>
