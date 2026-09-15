import { apiFetch } from './client';

export const auditApi = {
  getAll: (params?: Record<string, string | number | boolean>) => apiFetch('/audit-logs', { params }),
};