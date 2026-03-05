// src/lib/api/accounts.ts

import { apiClient } from './client';
import { Account } from '../types/account.types';

export const accountsApi = {
  // List accounts
  list: async (params?: any) => {
    const response = await apiClient.get('/accounts', { params });
    return response.data;
  },

  // Get single account
  get: async (id: string) => {
    const response = await apiClient.get(`/accounts/${id}`);
    return response.data;
  },

  // Get by code
  getByCode: async (code: string) => {
    const response = await apiClient.get(`/accounts/code/${code}`);
    return response.data;
  },

  // Create account
  create: async (data: Partial<Account>) => {
    const response = await apiClient.post('/accounts', data);
    return response.data;
  },

  // Update account
  update: async (id: string, data: Partial<Account>) => {
    const response = await apiClient.put(`/accounts/${id}`, data);
    return response.data;
  },

  // Deactivate account
  deactivate: async (id: string) => {
    const response = await apiClient.delete(`/accounts/${id}/deactivate`);
    return response.data;
  },

  // Get account tree
  getTree: async (rootId?: string) => {
    const response = await apiClient.get('/accounts/tree', {
      params: { rootId }
    });
    return response.data;
  },

  // Get account types
  getTypes: async () => {
    const response = await apiClient.get('/accounts/types');
    return response.data;
  }
};