export interface BudgetSummary {
  totalSpent: number;
  monthSpent: number;
  transactionsCount: number;
}

export interface BudgetExpenseItem {
  date: string;
  model: string;
  tokens: number;
  cost: number;
  description: string;
}