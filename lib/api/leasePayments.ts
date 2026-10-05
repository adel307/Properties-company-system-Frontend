import { apiFetch } from './client';

export const leasePaymentsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => apiFetch('/lease-payments', { params }),
  getById: (id: string) => apiFetch(`/lease-payments/${id}`),
  create: (data: Record<string, unknown>) => apiFetch('/lease-payments', { method: 'POST', body: data }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/lease-payments/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiFetch(`/lease-payments/${id}`, { method: 'DELETE' }),
};