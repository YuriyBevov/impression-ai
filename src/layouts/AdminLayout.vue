<template>
  <div class="admin-layout">
    <app-sidebar />
    
    <div class="main-content">
      <app-topbar :title="getTitle()" />
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
    
    <!-- Toast for notifications -->
    <Toast />
    <!-- ConfirmDialog for deletion confirmations -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '../components/layout/AppSidebar.vue';
import AppTopbar from '../components/layout/AppTopbar.vue';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useRoute } from 'vue-router';

const route = useRoute();

const getTitle = (): string => {
  if (route.name === 'Collection') {
    return `Collection: ${route.params.collectionName}`;
  }
  return route.name as string || 'Dashboard';
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8fafc;
}
</style>