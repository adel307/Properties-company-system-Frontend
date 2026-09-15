import { apiFetch } from './client';

export const expensesApi = {
  getAll: () => apiFetch('/expenses'),
  getById: (id) => apiFetch(`/expenses/${id}`),
  getOrderedByDate: () => apiFetch('/expenses', { params: { ordered_by_date: true } }),
  getByDate: (date) => apiFetch(`/expenses/${date}`),
  create: (data) => apiFetch('/expenses', { method: 'POST', body: data }),

  // Categories Sub-module
  categories: {
    getAll: () => apiFetch('/expense_categories'),
    getById: (id) => apiFetch(`/expense_categories/${id}`),
    create: (data) => apiFetch('/expense_categories', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/expense_categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/expense_categories/${id}`, { method: 'DELETE' }),
  },
};