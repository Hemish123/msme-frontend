import api, { apiCall } from './axios';

export const uploadExcel = (formData, onProgress) =>
  apiCall(() =>
    api.post('/upload/excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    })
  );

export const getUploadStatus = (id) =>
  apiCall(() => api.get(`/upload/status/${id}/`));

export const getUploadHistory = () =>
  apiCall(() => api.get('/upload/history/'));
