<template>
  <Card class="translate-form">
    <template #title>
      <div class="form-title-wrap">
        <div>
          <h2 class="form-title">Новый перевод</h2>
          <p class="form-subtitle">Выберите клиента, укажите направление и отправьте текст или документ на перевод.</p>
        </div>
      </div>
    </template>

    <template #content>
      <div class="formgrid grid">
        <div class="field col-12">
          <label for="client" class="block mb-2">Клиент</label>
          <Select
            id="client"
            v-model="selectedClient"
            :options="activeClients"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите клиента"
          >
            <template #option="slotProps">
              <div class="flex align-items-center justify-content-between w-full gap-2">
                <span>{{ slotProps.option.name }}</span>
                <Tag value="Активный" severity="success" />
              </div>
            </template>
          </Select>
          <small v-if="!selectedClient && submitted" class="p-error">Выберите клиента</small>
        </div>

        <div class="field col-12">
          <label class="block mb-2">Направление перевода</label>
          <div class="direction-display">
            <i class="pi pi-arrows-alt-h direction-icon"></i>
            <span class="direction-label">Русский ↔ Английский</span>
          </div>
          <small class="direction-hint">Исходный язык определяется автоматически по содержимому документа</small>
        </div>

        <div class="field col-12">
          <div class="field-header">
            <label for="source-text" class="block">Текст для перевода</label>
            <span class="text-counter">{{ sourceText.length }}/10000</span>
          </div>
          <Textarea
            id="source-text"
            v-model="sourceText"
            rows="10"
            placeholder="Вставьте текст для перевода или загрузите документ ниже"
            class="w-full source-textarea"
            :maxlength="10000"
            :class="{ 'p-invalid': !hasContent && submitted }"
          />
          <small v-if="!hasContent && submitted" class="p-error">Добавьте текст или загрузите документ</small>
        </div>

        <div class="field col-12">
          <label class="block mb-2">Документ</label>
          <FileUpload
            mode="advanced"
            :multiple="false"
            accept=".doc,.docx,.pdf,.txt,.rtf"
            :maxFileSize="10000000"
            chooseLabel="Выбрать документ"
            cancelLabel="Очистить"
            :showUploadButton="false"
            :auto="false"
            customUpload
            @select="handleFileSelect"
            @clear="clearSelectedFile"
            class="translate-upload"
          >
            <template #empty>
              <div class="upload-empty">
                <i class="pi pi-file-arrow-up"></i>
                <span>Перетащите файл сюда или выберите документ вручную</span>
              </div>
            </template>
          </FileUpload>
          <small v-if="selectedFile" class="selected-file">Выбран файл: {{ selectedFile.name }}</small>
        </div>

        <div class="field col-12">
          <Button
            label="Перевести"
            icon="pi pi-send"
            @click="translate"
            class="w-full translate-button"
            :disabled="!canSubmit"
            :loading="isLoading"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useClientsStore } from '@/stores/clients';
import type { Client } from '@/types/client';
import type { TranslateRequest } from '@/types/translation';

interface Props {
  isLoading: boolean;
  clearForm?: boolean;
  initialData?: Partial<{
    client_id: string;
    client_name: string;
    source_text: string;
    translation_pair: string;
  }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  translate: [data: TranslateRequest];
}>();

const clientsStore = useClientsStore();
const { activeClients } = storeToRefs(clientsStore);

const selectedClient = ref<string | null>(null);
const sourceText = ref('');
const selectedFile = ref<File | null>(null);
const submitted = ref(false);

const hasContent = computed(() => sourceText.value.trim() !== '' || !!selectedFile.value);

const canSubmit = computed(() => {
  return hasContent.value;
});

const handleFileSelect = (event: { files?: File[] }) => {
  selectedFile.value = event.files?.[0] ?? null;
};

const clearSelectedFile = () => {
  selectedFile.value = null;
};

const translate = () => {
  submitted.value = true;

  if (!canSubmit.value) {
    return;
  }

  const clients = activeClients.value as Client[];
  const client = clients.find((c: Client) => c.id === selectedClient.value) as Client | undefined;

  emit('translate', {
    client_id: selectedClient.value,
    client_name: client?.name || '',
    source_text: sourceText.value,
    translation_pair: 'ru-en'
  });
};

watch(() => props.isLoading, (newLoading, oldLoading) => {
  if (oldLoading && !newLoading) {
    submitted.value = false;
  }
});

// Watch for pre-fill data from history
watch(() => props.initialData, (val) => {
  if (val) {
    if (val.client_id) selectedClient.value = val.client_id;
    if (val.source_text) sourceText.value = val.source_text;
    submitted.value = false;
  }
}, { deep: true, immediate: true });

watch(() => props.clearForm, (val) => {
  if (val) {
    sourceText.value = '';
    selectedFile.value = null;
    selectedClient.value = null;
    submitted.value = false;
  }
});
</script>

<style scoped>
.translate-form {
  width: 100%;
  margin-bottom: 2rem;
  border-radius: 1.25rem;
}

.form-title-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.form-title {
  margin: 0;
  font-size: 1.5rem;
}

.form-subtitle {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary);
  line-height: 1.5;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.text-counter {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.direction-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-ground);
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
}

.direction-icon {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.direction-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
}

.direction-hint {
  display: block;
  margin-top: 0.75rem;
  color: var(--text-color-secondary);
}

.source-textarea {
  width: 100%;
  min-height: 14rem;
  resize: vertical;
}

.translate-form :deep(.p-textarea.p-component.w-full.source-textarea) {
  width: 100%;
}

.upload-empty {
  min-height: 7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-color-secondary);
}

.upload-empty i {
  font-size: 1.75rem;
}

.selected-file {
  display: block;
  margin-top: 0.75rem;
  color: var(--primary-color);
}

.translate-button {
  margin-top: 0.5rem;
}

.formgrid.grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.translate-form :deep(.p-card-body) {
  gap: 0.5rem;
  padding: 24px;
}

.translate-form :deep(.p-card-content) {
  padding: 0;
}

.translate-form :deep(.p-card-title) {
  padding: 0 0 0.5rem;
}

.translate-form :deep(.p-select),
.translate-form :deep(.p-selectbutton),
.translate-form :deep(.p-selectbutton .p-button),
.translate-form :deep(.p-fileupload),
.translate-form :deep(.p-fileupload .p-button) {
  width: 100%;
}

.translate-form :deep(.p-selectbutton) {
  display: flex;
}

.translate-form :deep(.p-selectbutton .p-button) {
  justify-content: center;
}

@media (max-width: 768px) {
  .field-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
