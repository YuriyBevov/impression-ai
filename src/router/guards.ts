import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/constants/routes';

export const setupGuards = (router: any) => {
  router.beforeEach((to: any, from: any) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record: any) => record.meta?.requiresAuth);
    const requiresNoAuth = to.matched.some((record: any) => record.meta?.requiresNoAuth);

    if (requiresAuth && !authStore.isAuthenticated) {
      return { path: ROUTES.login, query: { redirect: to.fullPath } };
    }

    if (requiresNoAuth && authStore.isAuthenticated && to.path === ROUTES.login) {
      return ROUTES.knowledge;
    }

    if (to.path === '/:pathMatch(.*)*') {
      return authStore.isAuthenticated ? ROUTES.knowledge : ROUTES.login;
    }

    return true;
  });
};
