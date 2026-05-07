import { http } from './http';
import type { Client } from '@/types/client';

export const clientsService = {
  fetchAll: async (): Promise<Client[]> => {
    try {
      const response = await http.get<Client[]>('/api/n8n/webhook/clients');
      return response.data;
    } catch (error) {
      console.warn('Clients endpoint unavailable (502 expected - no webhook yet)');
      return [];
    }
  },

  create: async (client: Partial<Client>): Promise<Client> => {
    const response = await http.post<Client>('/api/n8n/webhook/clients', client);
    return response.data;
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const response = await http.put<Client>(`/api/n8n/webhook/clients/${id}`, data);
    return response.data;
  }
};