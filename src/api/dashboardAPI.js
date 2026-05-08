import api, { apiCall } from './axios';

export const getDashboardStats = () =>
  apiCall(() => api.get('/dashboard/stats/'));

export const getPaymentTrend = () =>
  apiCall(() => api.get('/dashboard/payment-trend/'));

export const getTopCustomers = () =>
  apiCall(() => api.get('/dashboard/top-customers/'));

export const getDefaulters = () =>
  apiCall(() => api.get('/dashboard/defaulters/'));

export const getCreditDistribution = () =>
  apiCall(() => api.get('/dashboard/credit-distribution/'));
