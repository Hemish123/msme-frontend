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

// --- New Phase 1 Inventory APIs ---

export const getCategories = () => apiCall(() => api.get('/inventory/categories/'));
export const createCategory = (data) => apiCall(() => api.post('/inventory/categories/', data));
export const getSuppliers = () => apiCall(() => api.get('/inventory/suppliers/'));
export const createSupplier = (data) => apiCall(() => api.post('/inventory/suppliers/', data));
export const updateSupplier = (id, data) => apiCall(() => api.put(`/inventory/suppliers/${id}/`, data));
export const deleteSupplier = (id) => apiCall(() => api.delete(`/inventory/suppliers/${id}/`));


export const getProducts = () => apiCall(() => api.get('/inventory/products/'));
export const createProduct = (data) => apiCall(() => api.post('/inventory/products/', data));
export const updateProduct = (id, data) => apiCall(() => api.put(`/inventory/products/${id}/`, data));
export const deleteProduct = (id) => apiCall(() => api.delete(`/inventory/products/${id}/`));

export const adjustStock = (id, data) => apiCall(() => api.post(`/inventory/products/${id}/adjust-stock/`, data));
export const getLowStockProducts = () => apiCall(() => api.get('/inventory/products/low-stock/'));

export const getStockMovements = () => apiCall(() => api.get('/inventory/stock-movements/'));

export const getPurchases = () => apiCall(() => api.get('/inventory/purchases/'));
export const createPurchase = (data) => apiCall(() => api.post('/inventory/purchases/', data));
export const updatePurchase = (id, data) => apiCall(() => api.put(`/inventory/purchases/${id}/`, data));
export const deletePurchase = (id) => apiCall(() => api.delete(`/inventory/purchases/${id}/`));

export const receivePurchase = (id) => apiCall(() => api.post(`/inventory/purchases/${id}/receive/`));

export const getSales = () => apiCall(() => api.get('/inventory/sales/'));
export const createSale = (data) => apiCall(() => api.post('/inventory/sales/', data));
export const updateSale = (id, data) => apiCall(() => api.put(`/inventory/sales/${id}/`, data));
export const deleteSale = (id) => apiCall(() => api.delete(`/inventory/sales/${id}/`));


// Reports
export const getStockSummaryReport = () => apiCall(() => api.get('/inventory/reports/stock-summary/'));
export const getLowStockReport = () => apiCall(() => api.get('/inventory/reports/low-stock/'));
export const getStockValueReport = () => apiCall(() => api.get('/inventory/reports/stock-value/'));
export const getSalesSummaryReport = () => apiCall(() => api.get('/inventory/reports/sales-summary/'));
export const getPurchaseSummaryReport = () => apiCall(() => api.get('/inventory/reports/purchase-summary/'));

// Export report as PDF (backend-generated)
export const exportReportPDF = async (reportType) => {
  try {
    const response = await api.get(`/inventory/reports/${reportType}/export-pdf/`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const disposition = response.headers['content-disposition'];
    let filename = `${reportType}_report.pdf`;
    if (disposition) {
      const match = disposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { data: true, error: null };
  } catch (error) {
    console.error('PDF export error:', error);
    let errorMessage = 'Failed to export PDF';
    
    if (error.response && error.response.data instanceof Blob) {
      // Convert blob error response to text
      const text = await error.response.data.text();
      try {
        const json = JSON.parse(text);
        errorMessage = json.error || json.detail || errorMessage;
      } catch (e) {
        errorMessage = text || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { data: null, error: errorMessage };
  }
};
