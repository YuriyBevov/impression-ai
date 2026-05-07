<template>
  <div class="clients-table">
    <!-- Search and Filter Controls -->
    <div class="table-controls mb-3">
      <div class="flex flex-column sm:flex-row gap-3">
        <div class="flex-grow-1">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText 
              v-model="filters.search" 
              placeholder="Поиск по имени клиента..." 
              class="w-full sm:w-40rem"
            />
          </IconField>
        </div>
        
        <div class="w-full sm:w-15rem">
          <Select
            v-model="filters.status"
            :options="STATUS_OPTIONS"
            optionLabel="label"
            optionValue="value"
            placeholder="Все статусы"
            @change="updateFilters"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <!-- Data table -->
    <DataTable 
      :value="filteredClients" 
      :paginator="true" 
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]" 
      :loading="loading"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Показаны {first} - {last} из {totalRecords}"
      responsiveLayout="scroll"
      stripedRows
    >
      <Column field="name" header="Имя клиента" style="min-width: 200px;" sortable>
        <template #body="slotProps">
          <div class="client-name">
            <i class="pi pi-user mr-2 text-primary-500"></i>
            <span>{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="inn" header="ИНН" style="min-width: 140px;" sortable>
        <template #body="slotProps">
          {{ slotProps.data.inn || '-' }}
        </template>
      </Column>

      <Column field="email" header="Email" style="min-width: 200px;" sortable>
        <template #body="slotProps">
          {{ slotProps.data.email || '-' }}
        </template>
      </Column>

      <Column field="phone" header="Телефон" style="min-width: 150px;" sortable>
        <template #body="slotProps">
          {{ slotProps.data.phone || '-' }}
        </template>
      </Column>

      <Column field="status" header="Статус" style="min-width: 100px;">
        <template #body="slotProps">
          <ClientStatusTag :status="slotProps.data.status" />
        </template>
      </Column>

      <Column header="Действия" style="width: 150px;">
        <template #body="slotProps">
          <div class="actions-cell">
            <Button 
              icon="pi pi-pencil" 
              severity="secondary" 
              text 
              rounded 
              @click="$emit('edit-client', slotProps.data)"
              v-tooltip.bottom="'Редактировать'"
            />
            
            <Button 
              :icon="slotProps.data.status === 'active' ? 'pi pi-ban' : 'pi pi-refresh'"
              severity="secondary"
              text 
              rounded 
              @click="$emit(slotProps.data.status === 'active' ? 'archive-client' : 'activate-client', slotProps.data)"
              v-tooltip.bottom="slotProps.data.status === 'active' ? 'Архивировать' : 'Разархивировать'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { Client, ClientStatus } from '@/types/client';
import { CLIENT_STATUSES } from '@/constants/app';
import ClientStatusTag from '@/components/clients/ClientStatusTag.vue';

interface Props {
  clients: Client[];
  loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'edit-client': [client: Client];
  'archive-client': [client: Client];
  'activate-client': [client: Client];
}>();

const STATUS_OPTIONS = [
  { label: 'Все', value: '' },
  { label: 'Активные', value: 'active' },
  { label: 'Архив', value: 'archived' }
];

interface Filters {
  search: string;
  status: ClientStatus | '';
}

const filters = reactive<Filters>({
  search: '',
  status: ''
});

const filteredClients = computed(() => {
  return props.clients.filter(client => {
    const matchesSearch = !filters.search || 
      client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      client.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || client.status === filters.status;

    return matchesSearch && matchesStatus;
  });
});

const updateFilters = () => {
  // Filters are computed automatically
};
</script>

<style scoped>
.clients-table {
  width: 100%;
}

.clients-table :deep(.p-datatable-tbody > tr > td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clients-table :deep(.p-datatable-thead > tr > th) {
  white-space: nowrap;
}

.client-name {
  display: flex;
  align-items: center;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}
</style>