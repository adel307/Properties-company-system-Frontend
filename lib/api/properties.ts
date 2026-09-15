import { apiFetch } from './client';

export const propertiesApi = {
  // Query params: page, limit, status, min_area, max_area, started_after, ended_before, sort_by, search
  getAll: (params) => apiFetch('/properties', { params }),
  getById: (id) => apiFetch(`/properties/${id}`),
  getEmployees: (id) => apiFetch(`/properties/${id}/employees`),
  create: (data) => apiFetch('/properties', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/properties/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/properties/${id}`, { method: 'DELETE' }),

  // Apartments Sub-module
  apartments: {
    getAll: () => apiFetch('/apartments'),
    getById: (id) => apiFetch(`/apartments/${id}`),
    create: (data) => apiFetch('/apartments', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/apartments/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/apartments/${id}`, { method: 'DELETE' }),
  },
};