<template>
  <div class="empty-state">
    <div class="empty-icon">
      <i class="pi pi-inbox" style="font-size: 3rem;"></i>
    </div>
    <h3>{{ title || 'Нет данных' }}</h3>
    <p>{{ message || 'Нет элементов для отображения.' }}</p>
    <slot v-if="$slots.default" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  message?: string;
}

defineProps<Props>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  margin-bottom: 16px;
}
</style>