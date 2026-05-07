<template>
  <div class="expenses-table">
    <!-- Table Title -->
    <h3>Детализация расходов</h3>
    
    <!-- Data table -->
    <DataTable 
      :value="expenses" 
      :paginator="true" 
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]" 
      :loading="loading"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Показаны {first} - {last} из {totalRecords}"
      responsiveLayout="scroll"
      stripedRows
    >
      <Column field="date" header="Дата" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
      
      <Column field="model" header="Модель" sortable>
        <template #body="slotProps">
          <Tag :value="slotProps.data.model || 'N/A'" severity="info" />
        </template>
      </Column>

      <Column field="description" header="Описание" sortable>
        <template #body="slotProps">
          {{ slotProps.data.description || '-' }}
        </template>
      </Column>

      <Column field="tokens" header="Токены" style="width: 120px;" sortable>
        <template #body="slotProps">
          {{ formatTokens(slotProps.data.tokens) }}
        </template>
      </Column>
      
      <Column field="cost" header="Стоимость ($)" style="width: 120px;" sortable>
        <template #body="slotProps">
          {{ formatCost(slotProps.data.cost) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { BudgetExpenseItem } from '@/types/budget';
import { formatDate, formatCost, formatTokens } from '@/utils/formatters';

interface Props {
  expenses: BudgetExpenseItem[];
  loading: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.expenses-table {
  width: 100%;
}

.expenses-table h3 {
  margin-bottom: 1.5rem;
  color: #495057;
}
</style>