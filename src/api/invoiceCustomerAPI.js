import api, { apiCall } from './axios';

export const getInvoiceCustomers = (params = {}) =>
  apiCall(() => api.get('/invoice-customers/', { params }));

export const getInvoiceCustomer = (id) =>
  apiCall(() => api.get(`/invoice-customers/${id}/`));

export const createInvoiceCustomer = (data) =>
  apiCall(() => api.post('/invoice-customers/', data));

export const updateInvoiceCustomer = (id, data) =>
  apiCall(() => api.put(`/invoice-customers/${id}/`, data));

export const deleteInvoiceCustomer = (id) =>
  apiCall(() => api.delete(`/invoice-customers/${id}/`));

export const getInvoiceCustomerDropdown = () =>
  apiCall(() => api.get('/invoice-customers/dropdown/'));
