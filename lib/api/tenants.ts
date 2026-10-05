import { apiFetch } from './client';

export const tenantsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => apiFetch('/tenants', { params }),
  getById: (id: string) => apiFetch(`/tenants/${id}`),
  create: (data: Record<string, unknown>) => apiFetch('/tenants', { method: 'POST', body: data }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/tenants/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiFetch(`/tenants/${id}`, { method: 'DELETE' }),
};
