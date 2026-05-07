<template>
  <header class="app-header">
    <Toolbar>
      <template #start>
        <h2 class="app-title">{{ appName }}</h2>
      </template>

      <template #end>
        <div class="user-section">
          <span v-if="authStore.user" class="username">Привет, {{ authStore.user.username }}!</span>
          <Button label="Выйти" @click="handleLogout" severity="secondary" size="small" />
        </div>
      </template>
    </Toolbar>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { APP_NAME } from '@/constants/app';

const authStore = useAuthStore();
const router = useRouter();
const appName = APP_NAME;

const handleLogout = async () => {
  authStore.logout();
  await router.push('/login');
};
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--surface-card);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--surface-border);
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  margin-right: 10px;
  font-weight: 500;
}
</style>