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

onMounted(() => {
  authStore.initializeFromStorage();
});

const layoutComponent = computed(() => {
  if (route.meta?.requiresNoAuth) {
    return AuthLayout;
  }
  return AppLayout;
});
</script>

<style>
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
</style>