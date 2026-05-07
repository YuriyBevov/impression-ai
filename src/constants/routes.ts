export const ROUTES = {
  login: '/login',
  knowledge: '/knowledge',
  knowledgeCollection: '/knowledge/:collectionName',
  translate: '/translate',
  clients: '/clients',
  budget: '/budget',
  history: '/history'
} as const;

export type RouteName = keyof typeof ROUTES;