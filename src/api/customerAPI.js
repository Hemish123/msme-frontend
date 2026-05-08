import api, { apiCall } from './axios';

export const getCustomers = (params = {}) =>
  apiCall(() => api.get('/customers/', { params }));

export const getCustomer = (id) =>
  apiCall(() => api.get(`/customers/${id}/`));

export const createCustomer = (data) =>
  apiCall(() => api.post('/customers/', data));

export const updateCustomer = (id, data) =>
  apiCall(() => api.put(`/customers/${id}/`, data));

export const deleteCustomer = (id) =>
  apiCall(() => api.delete(`/customers/${id}/`));

export const getCustomerPayments = (id, params = {}) =>
  apiCall(() => api.get(`/customers/${id}/payments/`, { params }));

export const getCustomerSummary = (id) =>
  apiCall(() => api.get(`/customers/${id}/summary/`));

export const getCustomerCreditHistory = (id) =>
  apiCall(() => api.get(`/customers/${id}/credit-history/`));

export const assignCredit = (id, data) =>
  apiCall(() => api.post(`/customers/${id}/assign-credit/`, data));

// ── New endpoints for unified customer model ──────────────────

export const getCustomerDropdown = () =>
  apiCall(() => api.get('/customers/dropdown/'));

export const bulkUploadCustomers = (formData) =>
  apiCall(() => api.post('/customers/bulk-upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));

export const downloadCustomerTemplate = () =>
  apiCall(() => api.get('/templates/customer-template/', { responseType: 'blob' }));

export const downloadInventoryTemplate = () =>
  apiCall(() => api.get('/templates/inventory-template/', { responseType: 'blob' }));
