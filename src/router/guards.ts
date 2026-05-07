import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/constants/routes';

export const setupGuards = (router: any) => {
  router.beforeEach((to: any, from: any, next: any) => {
    const authStore = useAuthStore();
    
    if (to.matched.some((record: any) => record.meta?.requiresAuth)) {
      // This route requires auth
      if (!authStore.isAuthenticated) {
        // Redirect to login page
        next({
          path: ROUTES.login,
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    } else if (to.matched.some((record: any) => record.meta?.requiresNoAuth)) {
      // This route requires the user to be logged out
      if (authStore.isAuthenticated && to.path === ROUTES.login) {
        // Already logged in and trying to access login, redirect to knowledge
        next(ROUTES.knowledge);
      } else {
        next();
      }
    } else if (to.path === '/:pathMatch(.*)*') {
      // Unknown paths, redirect to knowledge if authenticated or login if not authenticated
      if (authStore.isAuthenticated) {
        next(ROUTES.knowledge);
      } else {
        next(ROUTES.login);
      }
    } else {
      // Non-auth route, proceed normally
      next();
    }
  });
};