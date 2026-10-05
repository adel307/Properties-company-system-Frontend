import { apiFetch } from './client';

export const paymentTransactionsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => apiFetch('/payment-transactions', { params }),
  getById: (id: string) => apiFetch(`/payment-transactions/${id}`),
  create: (data: Record<string, unknown>) => apiFetch('/payment-transactions', { method: 'POST', body: data }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/payment-transactions/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiFetch(`/payment-transactions/${id}`, { method: 'DELETE' }),
};