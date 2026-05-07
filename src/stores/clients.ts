import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Client, ClientsFilter } from '@/types/client';
import { clientsService } from '@/services/api/clients.service';

export const useClientsStore = defineStore('clients', () => {
  const items = ref<Client[]>([]);
  const activeItems = ref<Client[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const filter = ref<ClientsFilter>({ search: '', status: '' });

  const filteredItems = computed(() => {
    return items.value.filter(client => {
      const matchesSearch = !filter.value.search || 
        client.name.toLowerCase().includes(filter.value.search.toLowerCase()) ||
        client.email.toLowerCase().includes(filter.value.search.toLowerCase());
      
      const matchesStatus = !filter.value.status || client.status === filter.value.status;
      
      return matchesSearch && matchesStatus;
    });
  });

  const activeClients = computed(() => {
    return items.value.filter(client => client.status === 'active');
  });

  const fetchAll = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const clients = await clientsService.fetchAll();
      items.value = clients;
      activeItems.value = clients.filter(client => client.status === 'active');
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки клиентов';
    } finally {
      isLoading.value = false;
    }
  };

  const create = async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    isLoading.value = true;
    error.value = null;
    try {
      const client = await clientsService.create(data);
      items.value.push(client);
      if (client.status === 'active') {
        activeItems.value.push(client);
      }
      return client;
    } catch (err: any) {
      error.value = err.message || 'Ошибка создания клиента';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const update = async (id: string, data: Partial<Client>): Promise<Client> => {
    isLoading.value = true;
    error.value = null;
    try {
      const client = await clientsService.update(id, data);
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = client;
      }
      
      // Update active items if status changed
      const activeIndex = activeItems.value.findIndex(item => item.id === id);
      if (client.status === 'active') {
        if (activeIndex === -1) {
          activeItems.value.push(client);
        }
      } else if (activeIndex !== -1) {
        activeItems.value.splice(activeIndex, 1);
      }
      
      return client;
    } catch (err: any) {
      error.value = err.message || 'Ошибка обновления клиента';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const archive = async (id: string): Promise<void> => {
    await update(id, { status: 'archived' });
  };

  const activate = async (id: string): Promise<void> => {
    await update(id, { status: 'active' });
  };

  return {
    items,
    activeItems,
    isLoading,
    error,
    filter,
    filteredItems,
    activeClients,
    fetchAll,
    create,
    update,
    archive,
    activate
  };
});