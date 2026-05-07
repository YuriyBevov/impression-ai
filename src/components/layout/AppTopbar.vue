<template>
  <header class="topbar">
    <div class="topbar-title">
      <span>{{ title }}</span>
    </div>
    <div class="topbar-actions">
      <!-- Additional action buttons would go here if needed -->
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<style scoped>
.topbar {
  height: 60px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.topbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}
</style>