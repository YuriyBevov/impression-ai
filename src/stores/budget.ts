import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BudgetSummary, BudgetExpenseItem } from '@/types/budget';
import { budgetService } from '@/services/api/budget.service';

export const useBudgetStore = defineStore('budget', () => {
  const balance = ref<number>(0);
  const expenses = ref<BudgetExpenseItem[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const summary = computed((): BudgetSummary => {
    const totalSpent = expenses.value.reduce((sum, expense) => sum + expense.cost, 0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthSpent = expenses.value
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.cost, 0);
      
    return {
      totalSpent,
      monthSpent,
      transactionsCount: expenses.value.length
    };
  });

  const fetchBalance = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      balance.value = await budgetService.fetchBalance();
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки баланса';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchExpenses = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      expenses.value = await budgetService.fetchExpenses();
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки расходов';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    balance,
    expenses,
    isLoading,
    error,
    summary,
    fetchBalance,
    fetchExpenses
  };
});