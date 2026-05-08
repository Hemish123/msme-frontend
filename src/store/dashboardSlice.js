import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  paymentTrend: [],
  topCustomers: [],
  defaulters: [],
  creditDistribution: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action) => { state.stats = action.payload; },
    setPaymentTrend: (state, action) => { state.paymentTrend = action.payload; },
    setTopCustomers: (state, action) => { state.topCustomers = action.payload; },
    setDefaulters: (state, action) => { state.defaulters = action.payload; },
    setCreditDistribution: (state, action) => { state.creditDistribution = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const {
  setStats, setPaymentTrend, setTopCustomers, setDefaulters,
  setCreditDistribution, setLoading, setError,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
