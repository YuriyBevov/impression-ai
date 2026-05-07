<template>
  <div class="app-layout">
    <!-- Header -->
    <app-header />

    <!-- Sidebar -->
    <app-sidebar />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-left: 250px; /* Width of the sidebar */
  margin-top: 60px; /* Height of the header */
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  margin: 0 auto;
  width: 100%;
}

</style>