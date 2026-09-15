import { apiFetch } from './client';

export const materialsApi = {
  getAll: () => apiFetch('/materials'),
  getById: (id) => apiFetch(`/materials/${id}`),
  create: (data) => apiFetch('/materials', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/materials/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/materials/${id}`, { method: 'DELETE' }),
};