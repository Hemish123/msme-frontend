import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import customerReducer from './customerSlice';
import paymentReducer from './paymentSlice';
import dashboardReducer from './dashboardSlice';
import invoiceReducer from './invoiceSlice';
import inventoryReducer from './inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    payments: paymentReducer,
    dashboard: dashboardReducer,
    invoices: invoiceReducer,
    inventory: inventoryReducer,
  },
});
