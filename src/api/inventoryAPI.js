import api, { apiCall } from './axios';

export const getInventoryItems = (params = {}) =>
  apiCall(() => api.get('/inventory/', { params }));

export const getInventoryItem = (id) =>
  apiCall(() => api.get(`/inventory/${id}/`));

export const createInventoryItem = (data) =>
  apiCall(() => api.post('/inventory/', data));

export const updateInventoryItem = (id, data) =>
  apiCall(() => api.put(`/inventory/${id}/`, data));

export const deleteInventoryItem = (id) =>
  apiCall(() => api.delete(`/inventory/${id}/`));

export const getInventoryDropdown = (customerId) =>
  apiCall(() => api.get('/inventory/dropdown/', {
    params: customerId ? { customer: customerId } : {},
  }));
