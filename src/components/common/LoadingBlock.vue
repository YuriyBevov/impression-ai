<template>
  <div class="loading-block">
    <div class="spinner-container">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s" />
    </div>
    <span v-if="text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
}

defineProps<Props>();
</script>

<style scoped>
.loading-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner-container {
  margin-bottom: 12px;
}
</style>