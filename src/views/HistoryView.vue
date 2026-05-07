<template>
  <div class="history-view">
    <PageTitle title="История переводов" />
    <TranslationsHistoryTable
      :history-items="translationsStore.history"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTranslationsStore } from '@/stores/translations';
import { useClientsStore } from '@/stores/clients';
import PageTitle from '@/components/common/PageTitle.vue';
import TranslationsHistoryTable from '@/components/translate/TranslationsHistoryTable.vue';

const translationsStore = useTranslationsStore();
const clientsStore = useClientsStore();
const loading = ref(false);

const loadHistory = async () => {
  loading.value = true;
  try {
    await translationsStore.fetchHistory();
  } catch (error) {
    console.error('Failed to load history:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await clientsStore.fetchAll();
  await loadHistory();
});
</script>

<style scoped>
.history-view {
  margin: 0 auto;
  width: 100%;
}
</style>
