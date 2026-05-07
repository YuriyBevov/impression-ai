<template>
  <div class="translate-view">
    <PageTitle title="Сделать перевод" />

    <div class="translate-grid">
      <TranslateForm
        :is-loading="translationsStore.isLoading"
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

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTranslationsStore } from '@/stores/translations';
import { useClientsStore } from '@/stores/clients';
import type { TranslateRequest } from '@/types/translation';
import PageTitle from '@/components/common/PageTitle.vue';
import TranslateForm from '@/components/translate/TranslateForm.vue';
import TranslationResultCard from '@/components/translate/TranslationResultCard.vue'
import ErrorState from '@/components/common/ErrorState.vue';

const translationsStore = useTranslationsStore();
const clientsStore = useClientsStore();

const handleTranslate = async (data: TranslateRequest) => {
  try {
    await translationsStore.translate(data);
  } catch {
    // Store state already contains error details.
  }
};

const retryLastOperation = () => {
  translationsStore.error = null;
};

onMounted(async () => {
  await clientsStore.fetchAll();
});
</script>

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
