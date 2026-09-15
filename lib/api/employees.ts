import { apiFetch } from './client';

export const employeesApi = {
  // Query params: page, limit, sort_by="name", search
  getAll: (params?: Record<string, string | number | boolean>) => apiFetch('/employees', { params }),
  getById: (id) => apiFetch(`/employees/${id}`),
  create: (data) => apiFetch('/employees', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/employees/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/employees/${id}`, { method: 'DELETE' }),
};