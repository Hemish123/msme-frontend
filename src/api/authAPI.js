import api, { apiCall } from './axios';

export const loginUser = (credentials) =>
  apiCall(() => api.post('/auth/login/', credentials));

export const registerUser = (data) =>
  apiCall(() => api.post('/auth/register/', data));

export const logoutUser = (refreshToken) =>
  apiCall(() => api.post('/auth/logout/', { refresh: refreshToken }));

export const getMe = () =>
  apiCall(() => api.get('/auth/me/'));

export const updateProfile = (data) =>
  apiCall(() => api.put('/auth/me/', data));

export const refreshToken = (refresh) =>
  apiCall(() => api.post('/auth/token/refresh/', { refresh }));

export const deleteAccount = (refreshToken) =>
  apiCall(() => api.post('/auth/delete-account/', { refresh: refreshToken }));
