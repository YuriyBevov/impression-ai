<template>
  <div class="translate-view">
    <PageTitle title="Сделать перевод" />

    <div class="translate-grid">
      <TranslateForm
        :is-loading="translationsStore.isLoading"
        :clear-form="clearForm"
        :initial-data="formData"
        @translate="handleTranslate"
      />

      <ErrorState
        v-if="translationsStore.error && !translationsStore.currentResult"
        :message="translationsStore.error"
        @retry="retryLastOperation"
      />

      <TranslationResultCard
        v-if="translationsStore.currentResult"
        :translate-result="translationsStore.currentResult"
      />
    </div>

    <!-- Processing dialog -->
    <Dialog
      v-model:visible="showProcessingDialog"
      :closable="false"
      :draggable="false"
      modal
      header="Перевод запущен"
      class="processing-dialog"
    >
      <div class="dialog-body processing-body">
        <i class="pi pi-spin pi-spinner dialog-spinner"></i>
        <p class="dialog-message">Идёт процесс перевода. Пожалуйста, подождите...</p>
      </div>
    </Dialog>

    <!-- Clear data dialog -->
    <Dialog
      v-model:visible="showClearDialog"
      :closable="false"
      :draggable="false"
      modal
      header="Перевод завершён"
      class="clear-dialog"
    >
      <div class="dialog-body clear-body">
        <i class="pi pi-check-circle success-icon"></i>
        <p class="dialog-message">Перевод успешно выполнен!</p>
        <p class="dialog-question">Очистить предыдущие данные?</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Нет"
            severity="secondary"
            @click="showClearDialog = false"
          />
          <Button
            label="Да"
            @click="onClearConfirm"
          />
        </div>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useTranslationsStore } from '@/stores/translations';
import { useClientsStore } from '@/stores/clients';
import { translateService } from '@/services/api/translate.service';
import type { TranslateRequest, TranslationHistoryItem } from '@/types/translation';
import PageTitle from '@/components/common/PageTitle.vue';
import TranslateForm from '@/components/translate/TranslateForm.vue';
import TranslationResultCard from '@/components/translate/TranslationResultCard.vue'
import ErrorState from '@/components/common/ErrorState.vue';
import Dialog from 'primevue/dialog';

const translationsStore = useTranslationsStore();
const clientsStore = useClientsStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const showProcessingDialog = ref(false);
const showClearDialog = ref(false);
const clearForm = ref(false);

// Data pre-filled from history item
const formData = reactive<Partial<{
  client_id: string;
  client_name: string;
  source_text: string;
  translation_pair: string;
}>>({});

const handleTranslate = async (data: TranslateRequest) => {
  clearForm.value = false;
  showProcessingDialog.value = true;

  try {
    await translationsStore.translate(data);

    // Success
    showProcessingDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Перевод успешно завершён!',
      life: 3000
    });

    // Ask to clear
    setTimeout(() => {
      showClearDialog.value = true;
    }, 500);
  } catch {
    showProcessingDialog.value = false;
  }
};

const onClearConfirm = () => {
  clearForm.value = true;
  showClearDialog.value = false;
  translationsStore.currentResult = null;
};

const retryLastOperation = () => {
  translationsStore.error = null;
};

const fillFromHistory = async (historyId: string) => {
  try {
    const item = await translateService.getHistoryItem(historyId);
    formData.client_id = item.client_id || '';
    formData.client_name = item.client_name || '';
    formData.source_text = item.source_text || '';
    formData.translation_pair = item.translation_pair || `${item.source_lang}-${item.target_lang}` || 'ru-en';
    toast.add({
      severity: 'info',
      summary: 'Данные загружены',
      detail: 'Текст и клиент из истории подставлены в форму.',
      life: 3000
    });
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить данные из истории.',
      life: 3000
    });
  }
};

// Handle fillFromHistory query param
watch(() => route.query.fillFromHistory, async (val) => {
  if (val && typeof val === 'string') {
    await fillFromHistory(val);
    // Clean query param after filling
    router.replace({ query: {} });
  }
});

// Also check on mount
onMounted(async () => {
  await clientsStore.fetchAll();

  const fillId = route.query.fillFromHistory;
  if (fillId && typeof fillId === 'string') {
    await fillFromHistory(fillId);
    router.replace({ query: {} });
  }
});
</script>

<style scoped>
.dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
  text-align: center;
}

.dialog-spinner {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.success-icon {
  font-size: 2.5rem;
  color: var(--green-500);
}

.dialog-message {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0;
  line-height: 1.5;
}

.dialog-question {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.clear-body {
  gap: 0.75rem;
}

.processing-dialog :deep(.p-dialog-header),
.clear-dialog :deep(.p-dialog-header) {
  padding-bottom: 0.5rem;
}
</style>

<style scoped>
.translate-view {
  margin: 0 auto;
  width: 100%;
}

.translate-grid {
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.translate-form :deep(.p-textarea.p-component.w-full.source-textarea) {
  width: 100%;
}

.translate-form :deep(.p-select),
.translate-form :deep(.p-selectbutton),
.translate-form :deep(.p-selectbutton .p-button),
.translate-form :deep(.p-fileupload),
.translate-form :deep(.p-fileupload .p-button) {
  width: 100%;
}

</style>
