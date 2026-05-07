<template>
  <div class="budget-summary-cards">
    <!-- Summary Cards -->
    <div class="card-row">
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <div class="summary-icon bg-blue-100 text-blue-500">
              <i class="pi pi-dollar pi-lg"></i>
            </div>
            <div class="summary-details">
              <h4>Всего потрачено</h4>
              <p class="summary-value">${{ formatCost(budgetStore.summary.totalSpent || 0) }}</p>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <div class="summary-icon bg-green-100 text-green-500">
              <i class="pi pi-chart-line pi-lg"></i>
            </div>
            <div class="summary-details">
              <h4>За текущий месяц</h4>
              <p class="summary-value">${{ formatCost(budgetStore.summary.monthSpent || 0) }}</p>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <div class="summary-icon bg-purple-100 text-purple-500">
              <i class="pi pi-history pi-lg"></i>
            </div>
            <div class="summary-details">
              <h4>Количество транзакций</h4>
              <p class="summary-value">{{ budgetStore.summary.transactionsCount || 0 }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBudgetStore } from '@/stores/budget';
import { formatCost } from '@/utils/formatters';

const budgetStore = useBudgetStore();
</script>

<style scoped>
.budget-summary-cards {
  margin-bottom: 2rem;
}

.card-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  height: 120px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-details {
  flex: 1;
}

.summary-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.summary-details .summary-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
}
</style>