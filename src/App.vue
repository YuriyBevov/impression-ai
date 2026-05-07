<template>
  <div id="app">
    <component :is="layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { onMounted } from 'vue';

const route = useRoute();
const authStore = useAuthStore();

// Initialize auth from storage when app starts
onMounted(() => {
  authStore.initializeFromStorage();
  
  // Inject PrimeVue overrides after PrimeVue runtime styles
  const injectOverrides = () => {
    // Check if PrimeVue a theme style has already been injected
    const existing = document.getElementById('pv-override-styles');
    if (existing) return;
    
    const style = document.createElement('style');
    style.id = 'pv-override-styles';
    style.textContent = `
      .p-datatable-column-sorted {
        background: transparent !important;
        color: #ffffff !important;
      }
      .p-datatable-header-cell {
        background: var(--p-datatable-row-striped-background) !important;
        color: #ffffff !important;
        cursor: pointer !important;
      }
      .p-datatable-header-cell:hover {
        background: var(--p-datatable-row-hover-background, rgba(255,255,255,0.1)) !important;
      }
      .p-datatable-column-sorted:hover {
        background: var(--p-datatable-row-hover-background, rgba(255,255,255,0.1)) !important;
      }
    `;
    document.head.appendChild(style);
  };
  
  // Run after a microtask to let PrimeVue inject its theme first
  requestAnimationFrame(() => requestAnimationFrame(injectOverrides));
});

// Map routes to their respective layouts
const layoutComponent = computed(() => {
  // Check the route's meta to determine appropriate layout
  if (route.meta?.requiresNoAuth) {
    return AuthLayout; // Login page uses AuthLayout
  }
  
  // All other pages use AppLayout
  return AppLayout; 
});
</script>

<style>
/* Global styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* PrimeVue Toolbar */
.p-toolbar {
  border-radius: 0 !important;
}

/* PrimeVue DataTable overrides */
.p-datatable-paginator-bottom {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
  margin-top: 12px;
}

.p-datatable-table-container {
  border-radius: var(--border-radius, 6px) !important;
}

.p-datatable-header-cell {
  border: none !important;
  border-bottom: none !important;
  border-block-end: none !important;
}

.p-datatable-tbody > tr {
  border-bottom: none !important;
}

.p-datatable-tbody > tr > td {
  border: none !important;
  border-bottom: none !important;
  border-block-end: none !important;
}

.p-datatable-header-cell {
  background: var(--p-datatable-row-striped-background);
  color: #ffffff;
}
</style>