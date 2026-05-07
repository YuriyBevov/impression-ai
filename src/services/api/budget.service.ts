import { http } from './http';
import type { BudgetExpenseItem } from '@/types/budget';

export const budgetService = {
  fetchBalance: async (): Promise<number> => {
    const response = await http.get<any>('/api/openrouter/auth/key');
    // OpenRouter returns usage info from this endpoint for non-management keys
    const data = response.data?.data;
    if (data && typeof data.usage === 'number') {
      // usage is total spent in USD
      return data.usage;
    }
    return 0;
  },

  fetchExpenses: async (): Promise<BudgetExpenseItem[]> => {
    // OpenRouter's activity endpoint requires management key.
    // We extract what we can from the auth/key endpoint and return as a single expense item.
    const response = await http.get<any>('/api/openrouter/auth/key');
    const data = response.data?.data;
    if (data && typeof data.usage_monthly === 'number') {
      return [{
        date: new Date().toISOString().split('T')[0],
        cost: data.usage_monthly,
        description: 'Расходы за месяц',
        model: 'All models',
        tokens: data.usage || 0
      }];
    }
    return [];
  }
};  