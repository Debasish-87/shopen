// src/types/index.ts

export type Category = 'Food' | 'Medical' | 'Café';
export type StatusFilter = 'all' | 'open' | 'closed';

export interface Shop {
  id: number;
  name: string;
  category: Category;
  subcat: string;
  icon: string;
  address: string;
  phone: string;
  hours: string;
  is_open: boolean;
  description: string;
  photo_url: string;
  map_query: string;
  created_at: string;
  updated_at: string;
}

export interface CreateShopPayload {
  name: string;
  category: Category;
  subcat: string;
  icon: string;
  address: string;
  phone: string;
  hours: string;
  is_open: boolean;
  description: string;
  photo_url: string;
  map_query: string;
}

export type UpdateShopPayload = Partial<CreateShopPayload>;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  message: string;
}

export interface StatsResponse {
  total: number;
  open: number;
  closed: number;
  open_rate: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ShopFilters {
  category: Category | '';
  subcat: string;
  status: StatusFilter;
  search: string;
}
