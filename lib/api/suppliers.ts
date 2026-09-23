import { apiFetch } from './client';

export const suppliersApi = {
  // Query params: page, limit, sort_by, search, has_debt
  getAll: (params = { page: 1, limit: 20, has_debt: 'all' }) => apiFetch('/suppliers', { params }),
  getTotalDebt: () => apiFetch('/suppliers/total_debt'),
  getDetails: () => apiFetch('/suppliers/details'),
  getById: (id) => apiFetch(`/suppliers/${id}`),
  getSupplierDebt: (id) => apiFetch(`/suppliers/${id}/total_debt`),
  create: (data) => apiFetch('/suppliers', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/suppliers/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/suppliers/${id}`, { method: 'DELETE' }),
};