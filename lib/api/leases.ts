import { apiFetch } from './client';

export const leasesApi = {
  getAll: (params?: Record<string, string | number | boolean>) => apiFetch('/leases', { params }),
  getById: (id: string) => apiFetch(`/leases/${id}`),
  create: (data: Record<string, unknown>) => apiFetch('/leases', { method: 'POST', body: data }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/leases/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiFetch(`/leases/${id}`, { method: 'DELETE' }),
};
