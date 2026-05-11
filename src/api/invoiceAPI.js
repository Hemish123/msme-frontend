import api, { apiCall } from './axios';

export const getInvoices = (params = {}) =>
  apiCall(() => api.get('/invoices/', { params }));

export const getInvoice = (id) =>
  apiCall(() => api.get(`/invoices/${id}/`));

export const createInvoice = (data) =>
  apiCall(() => api.post('/invoices/create/', data));

export const getNextInvoiceNumber = () =>
  apiCall(() => api.get('/invoices/next-number/'));

export const updateInvoice = (id, data) =>
  apiCall(() => api.patch(`/invoices/${id}/`, data));

export const deleteInvoice = (id) =>
  apiCall(() => api.delete(`/invoices/${id}/`));

export const getInvoicePDFUrl = (id, template) => {
  const base = `${api.defaults.baseURL}/invoices/${id}/pdf/`;
  return template ? `${base}?template=${template}` : base;
};

export const downloadInvoicePDF = (id, template) => {
  const params = template ? { template } : {};
  return apiCall(() => api.get(`/invoices/${id}/pdf/`, { responseType: 'blob', params }));
};

export const resendInvoiceEmail = (id) =>
  apiCall(() => api.post(`/invoices/${id}/resend-email/`));

export const getInvoiceStats = () =>
  apiCall(() => api.get('/invoices/stats/'));

export const getInvoiceTemplates = () =>
  apiCall(() => api.get('/invoices/templates/'));

export const scheduleInvoiceReminder = (id, scheduled_at) =>
  apiCall(() => api.post(`/invoices/${id}/schedule-reminder/`, { scheduled_at }));

