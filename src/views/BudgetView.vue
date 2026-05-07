<template>
  <div class="budget-view">
    <!-- Page Title -->
    <PageTitle title="Бюджет" />
    
    <!-- Error State -->
    <ErrorState 
      v-if="budgetStore.error" 
      :message="budgetStore.error" 
      @retry="refreshData"
    />
    
    <template v-else>
      <!-- Budget Summary Cards -->
      <BudgetSummaryCards />
      
      <!-- Expenses Table -->
      <BudgetExpensesTable
        :expenses="budgetStore.expenses"
        :loading="budgetStore.isLoading"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBudgetStore } from '@/stores/budget';
import PageTitle from '@/components/common/PageTitle.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import BudgetSummaryCards from '@/components/budget/BudgetSummaryCards.vue';
import BudgetExpensesTable from '@/components/budget/BudgetExpensesTable.vue';

const budgetStore = useBudgetStore();

const refreshData = async () => {
  await Promise.all([
    budgetStore.fetchBalance(),
    budgetStore.fetchExpenses()
  ]);
};

onMounted(() => {
  refreshData();
});
</script>