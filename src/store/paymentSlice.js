import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  yearlyData: [],
  customerScores: [],
  heatmapData: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setYearlyData: (state, action) => { state.yearlyData = action.payload; },
    setCustomerScores: (state, action) => { state.customerScores = action.payload; },
    setHeatmapData: (state, action) => { state.heatmapData = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const {
  setYearlyData, setCustomerScores, setHeatmapData, setLoading, setError,
} = paymentSlice.actions;
export default paymentSlice.reducer;
