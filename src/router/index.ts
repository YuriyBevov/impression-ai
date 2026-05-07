import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { ROUTES } from '@/constants/routes';

const routes: Array<RouteRecordRaw> = [
  {
    path: ROUTES.login,
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresNoAuth: true }
  },
  {
    path: ROUTES.knowledge,
    name: 'Knowledge',
    component: () => import('@/views/knowledge/KnowledgeListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTES.knowledgeCollection,
    name: 'KnowledgeCollection',
    component: () => import('@/views/knowledge/KnowledgeCollectionView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: ROUTES.translate,
    name: 'Translate',
    component: () => import('@/views/TranslateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTES.clients,
    name: 'Clients',
    component: () => import('@/views/ClientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTES.history,
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTES.budget,
    name: 'Budget',
    component: () => import('@/views/BudgetView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: ROUTES.knowledge
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: ROUTES.knowledge
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;