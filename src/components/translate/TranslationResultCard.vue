<template>
  <Card class="result-card">
    <template #title>
      <div class="flex justify-between align-items-center">
        <span>Результат перевода</span>
        <span class="text-sm font-normal">{{ formatDate(new Date().toISOString()) }}</span>
      </div>
    </template>
    <template #content>
      <div class="result-content">
        <div class="source-section mb-4">
          <div class="section-label">Исходный текст:</div>
          <div class="original-text">{{ translateResult?.client_name }}</div>
          <div class="text-content">{{ translateResult?.source_text }}</div>
        </div>
        
        <div class="translation-section">
          <div class="section-label">Результат:</div>
          <div class="translation-text">{{ translateResult?.translated_text }}</div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="result-meta">
        <div class="meta-item">
          <i class="pi pi-server mr-2"></i>
          Модель: {{ translateResult?.model || 'N/A' }}
        </div>
        <div class="meta-item">
          <i class="pi pi-calculator mr-2"></i>
          Токенов: {{ translateResult?.tokens || 'N/A' }}
        </div>
        <div class="meta-item">
          <i class="pi pi-dollar mr-2"></i>
          Стоимость: {{ formatCost(translateResult?.cost || 0) }} $
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { formatDate, formatCost } from '@/utils/formatters';

interface Props {
  translateResult: any;
}

defineProps<Props>();
</script>

<style scoped>
.result-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-label {
  font-weight: bold;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.original-text {
  font-style: italic;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.text-content {
  padding: 0.5rem 0;
  line-height: 1.5;
}

.translation-text {
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 4px;
  border-left: 2px solid #3b82f6;
  line-height: 1.6;
  white-space: pre-line;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .result-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>