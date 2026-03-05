// src/lib/api/policies.ts

import { apiClient } from './client';
import { Policy, EventContext } from '../types/policy.types';

export const policiesApi = {
  // Get all policies
  list: async (params?: any) => {
    const response = await apiClient.get('/policies', { params });
    return response.data;
  },

  // Get single policy
  get: async (id: string) => {
    const response = await apiClient.get(`/policies/${id}`);
    return response.data;
  },

  // Create policy
  create: async (data: Partial<Policy>) => {
    const response = await apiClient.post('/policies', data);
    return response.data;
  },

  // Update policy
  update: async (id: string, data: Partial<Policy>) => {
    const response = await apiClient.put(`/policies/${id}`, data);
    return response.data;
  },

  // Delete policy
  delete: async (id: string) => {
    const response = await apiClient.delete(`/policies/${id}`);
    return response.data;
  },

  // Test policy in sandbox
  test: async (policy: Partial<Policy>, context: EventContext) => {
    const response = await apiClient.post('/policies/test', { policy, context });
    return response.data;
  },

  // Emit event
  emitEvent: async (eventType: string, data: any, async = false) => {
    const response = await apiClient.post('/policies/events', {
      eventType,
      data,
      async
    });
    return response.data;
  },

  // Get event types
  getEventTypes: async () => {
    const response = await apiClient.get('/policies/event-types');
    return response.data;
  }
};