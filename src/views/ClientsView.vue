<template>
  <div class="clients-view">
    <!-- Page Title -->
    <PageTitle title="Клиенты">
      <template #actions>
        <Button 
          label="Добавить клиента" 
          icon="pi pi-plus" 
          @click="showAddDialog = true"
        />
      </template>
    </PageTitle>
    
    <!-- Error State -->
    <ErrorState 
      v-if="clientsStore.error" 
      :message="clientsStore.error" 
      @retry="loadClients"
    />
    
    <!-- Clients Table -->
    <ClientsTable
      v-if="!clientsStore.error"
      :clients="clientsStore.items"
      :loading="clientsStore.isLoading"
      @edit-client="handleEditClient"
      @archive-client="handleArchiveClient"
      @activate-client="handleActivateClient"
    />

    <!-- Client Dialog -->
    <ClientDialog
      :visible="showAddDialog || !!editingClient"
      :client="editingClient as any || undefined"
      @save="handleSaveClient"
      @close="handleCloseDialog"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useClientsStore } from '@/stores/clients';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { Client } from '@/types/client';
import PageTitle from '@/components/common/PageTitle.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import ClientsTable from '@/components/clients/ClientsTable.vue';
import ClientDialog from '@/components/clients/ClientDialog.vue';

const clientsStore = useClientsStore();
const confirm = useConfirm();
const toast = useToast();

// State for dialogs
const showAddDialog = ref(false);
const editingClient = ref<Client | null>(null);

const handleEditClient = (client: Client) => {
  editingClient.value = client;
};

const handleArchiveClient = (client: Client) => {
  confirm.require({
    message: `Вы уверены, что хотите заархивировать клиента "${client.name}"?`,
    header: 'Подтверждение архивации',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await clientsStore.archive(client.id);
        toast.add({ severity: 'success', summary: 'Успех', detail: 'Клиент успешно архивирован', life: 3000 });
      } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Произошла ошибка при архивации клиента', life: 4000 });
      }
    }
  });
};

const handleActivateClient = (client: Client) => {
  confirm.require({
    message: `Вы уверены, что хотите активировать клиента "${client.name}"?`,
    header: 'Подтверждение активации',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await clientsStore.activate(client.id);
        toast.add({ severity: 'success', summary: 'Успех', detail: 'Клиент успешно активирован', life: 3000 });
      } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Произошла ошибка при активации клиента', life: 4000 });
      }
    }
  });
};

const handleSaveClient = async (clientData: Partial<Client>) => {
  try {
    if (editingClient.value) {
      // Update existing client
      await clientsStore.update(editingClient.value.id, clientData);
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Клиент успешно обновлен', life: 3000 });
    } else {
      // Create new client
      await clientsStore.create(clientData as any);
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Клиент успешно создан', life: 3000 });
    }
    handleCloseDialog();
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Произошла ошибка при сохранении клиента', life: 4000 });
  }
};

const handleCloseDialog = () => {
  showAddDialog.value = false;
  editingClient.value = null;
};

const loadClients = () => {
  clientsStore.fetchAll();
};

onMounted(() => {
  loadClients();
});
</script>