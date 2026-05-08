import api, { apiCall } from './axios';

export const getYearlyAnalytics = () =>
  apiCall(() => api.get('/analytics/yearly/'));

export const getCustomerScores = () =>
  apiCall(() => api.get('/analytics/customer-scores/'));

export const getMonthlyHeatmap = () =>
  apiCall(() => api.get('/analytics/monthly-heatmap/'));
