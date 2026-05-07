<template>
  <div class="error-state">
    <div class="error-icon">
      <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #e74c3c;"></i>
    </div>
    <h3>Ошибка</h3>
    <p>{{ message || 'Произошла ошибка при загрузке данных.' }}</p>
    <Button @click="$emit('retry')" label="Повторить" severity="danger" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
}

defineProps<Props>();
defineEmits(['retry']);
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.error-icon {
  margin-bottom: 16px;
}
</style>