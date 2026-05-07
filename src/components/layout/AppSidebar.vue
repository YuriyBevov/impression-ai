<template>
  <aside class="app-sidebar">
    <PanelMenu :model="menuItems" class="w-full" />
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/constants/routes';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  authStore.logout();
  await router.push('/login');
};

const menuItems = [
  {
    label: 'База знаний',
    icon: 'pi pi-book',
    command: () => router.push(ROUTES.knowledge)
  },
  {
    label: 'Сделать перевод',
    icon: 'pi pi-refresh',
    command: () => router.push(ROUTES.translate)
  },
  {
    label: 'Клиенты',
    icon: 'pi pi-users',
    command: () => router.push(ROUTES.clients)
  },
  {
    label: 'История переводов',
    icon: 'pi pi-clock',
    command: () => router.push(ROUTES.history)
  },
  {
    label: 'Бюджет',
    icon: 'pi pi-dollar',
    command: () => router.push(ROUTES.budget)
  },
  {
    label: 'Выйти',
    icon: 'pi pi-sign-out',
    command: handleLogout
  }
];
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  left: 0;
  top: 60px; /* Height of header */
  bottom: 0;
  width: 250px;
  background-color: var(--surface-card);
  border-right: 1px solid var(--surface-border);
  padding: 1rem;
  z-index: 999;
  overflow-y: auto;
}

.p-panelmenu {
  border: none;
  background: transparent;
}
</style>