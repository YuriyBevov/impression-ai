export type ClientStatus = 'active' | 'archived';

export interface Client {
  id: string;
  name: string;
  inn: string;
  legal_address: string;
  email: string;
  phone: string;
  contact_info: string;
  notes: string;
  status: ClientStatus;
  collection_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClientsFilter {
  search: string;
  status: ClientStatus | '';
}