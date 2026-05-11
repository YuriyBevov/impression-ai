<template>
  <Card class="translate-form">
    <template #title>
      <div class="form-title-wrap">
        <div>
          <h2 class="form-title">Новый перевод</h2>
          <p class="form-subtitle">Выберите клиента и отправьте текст на перевод.</p>
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

        <!-- Two-column translation layout: source + result side by side -->
        <div class="translation-columns">
          <!-- Left: Source text -->
          <div class="field source-col">
            <div class="field-header">
              <label for="source-text" class="block">Текст для перевода</label>
              <span class="text-counter">{{ sourceText.length }}/10000</span>
            </div>
            <Textarea
              id="source-text"
              v-model="sourceText"
              rows="12"
              placeholder="Вставьте текст для перевода сюда..."
              class="w-full source-textarea"
              :maxlength="10000"
              :class="{ 'p-invalid': !hasContent && submitted }"
            />
            <small v-if="!hasContent && submitted" class="p-error">Добавьте текст</small>
          </div>

          <!-- Right: Result text -->
          <div class="field result-col">
            <label for="result-text" class="block">Результат перевода</label>
            <Textarea
              id="result-text"
              v-model="resultText"
              rows="12"
              placeholder="Готовый перевод появится здесь..."
              class="w-full result-textarea"
              :class="{ 'result-filled': !!resultText }"
              readonly
            />
          </div>
        </div>

        <div class="field col-12">
          <label class="block mb-2">Направление перевода</label>
          <div class="direction-display">
            <i class="pi pi-arrows-alt-h direction-icon"></i>
            <span class="direction-label">Русский ↔ Английский</span>
          </div>
          <small class="direction-hint">Исходный язык определяется автоматически</small>
        </div>

        <div class="field col-12" v-if="false">
          <!-- File upload temporarily hidden -->
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
    result_text: string;
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
const resultText = ref('');
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

  const clients = (activeClients.value || []) as Client[];
  const client = clients.find((c: Client) => c.id === selectedClient.value) as Client | undefined;

  resultText.value = ''; // Clear previous result before new translation

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
    if (val.result_text) resultText.value = val.result_text;
    submitted.value = false;
  }
}, { deep: true, immediate: true });

watch(() => props.clearForm, (val) => {
  if (val) {
    sourceText.value = '';
    resultText.value = '';
    selectedFile.value = null;
    selectedClient.value = null;
    submitted.value = false;
  }
});

// Expose resultText to parent
defineExpose({ resultText });
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
}

.form-title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

/* Two-column layout */
.translation-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1rem;
}

.source-col, .result-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-counter {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.source-textarea,
.result-textarea {
  width: 100%;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
}

.result-textarea {
  background-color: var(--surface-ground) !important;
}

.result-textarea.result-filled {
  border-left: 3px solid #3b82f6;
}

.direction-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface-ground);
  border-radius: 8px;
  border: 1px solid var(--p-textarea-border-color);
}

.direction-icon {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.direction-label {
  font-weight: 500;
}

.direction-hint {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

.translate-button {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .translation-columns {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formgrid.grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.translate-form :deep(.p-textarea.p-component.w-full.source-textarea) {
  width: 100%;
}

.translate-form :deep(.p-select),
.translate-form :deep(.p-selectbutton),
.translate-form :deep(.p-selectbutton .p-button) {
  width: 100%;
}

.translate-upload :deep(.p-fileupload-buttonbar) {
  border-radius: 8px;
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-color-secondary);
  padding: 1.5rem;
}

.upload-empty i {
  font-size: 2rem;
  opacity: 0.5;
}

.selected-file {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  color: var(--primary-color);
}
</style>
