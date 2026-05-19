import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as inventoryAPI from '../api/inventoryAPI';

// Async Thunks
export const fetchProducts = createAsyncThunk('inventory/fetchProducts', async (_, { rejectWithValue }) => {
    const { data, error } = await inventoryAPI.getProducts();
    if (error) return rejectWithValue(error);
    return data?.results || data;
});

export const fetchCategories = createAsyncThunk('inventory/fetchCategories', async (_, { rejectWithValue }) => {
    const { data, error } = await inventoryAPI.getCategories();
    if (error) return rejectWithValue(error);
    return data?.results || data;
});

export const fetchSuppliers = createAsyncThunk('inventory/fetchSuppliers', async (_, { rejectWithValue }) => {
    const { data, error } = await inventoryAPI.getSuppliers();
    if (error) return rejectWithValue(error);
    return data?.results || data;
});

export const fetchPurchases = createAsyncThunk('inventory/fetchPurchases', async (_, { rejectWithValue }) => {
    const { data, error } = await inventoryAPI.getPurchases();
    if (error) return rejectWithValue(error);
    return data?.results || data;
});

export const fetchSales = createAsyncThunk('inventory/fetchSales', async (_, { rejectWithValue }) => {
    const { data, error } = await inventoryAPI.getSales();
    if (error) return rejectWithValue(error);
    return data?.results || data;
});

export const fetchStockMovements = createAsyncThunk('inventory/fetchStockMovements', async (_, { rejectWithValue }) => {
    const { data, error } = await inventoryAPI.getStockMovements();
    if (error) return rejectWithValue(error);
    return data?.results || data;
});

const initialState = {
    products: [],
    categories: [],
    suppliers: [],
    purchases: [],
    sales: [],
    stockMovements: [],
    loading: {
        products: false,
        categories: false,
        suppliers: false,
        purchases: false,
        sales: false,
        stockMovements: false
    },
    error: null
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Products
            .addCase(fetchProducts.pending, (state) => { state.loading.products = true; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading.products = false;
                const p = action.payload;
                state.products = Array.isArray(p) ? p : (p?.data?.results || p?.results || p?.data || []);
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading.products = false;
                state.error = action.payload;
            })
            // Categories
            .addCase(fetchCategories.pending, (state) => { state.loading.categories = true; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading.categories = false;
                const p = action.payload;
                state.categories = Array.isArray(p) ? p : (p?.data?.results || p?.results || p?.data || []);
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading.categories = false;
                state.error = action.payload;
            })
            // Suppliers
            .addCase(fetchSuppliers.pending, (state) => { state.loading.suppliers = true; })
            .addCase(fetchSuppliers.fulfilled, (state, action) => {
                state.loading.suppliers = false;
                const p = action.payload;
                state.suppliers = Array.isArray(p) ? p : (p?.data?.results || p?.results || p?.data || []);
            })
            .addCase(fetchSuppliers.rejected, (state, action) => {
                state.loading.suppliers = false;
                state.error = action.payload;
            })
            // Purchases
            .addCase(fetchPurchases.pending, (state) => { state.loading.purchases = true; })
            .addCase(fetchPurchases.fulfilled, (state, action) => {
                state.loading.purchases = false;
                const p = action.payload;
                state.purchases = Array.isArray(p) ? p : (p?.data?.results || p?.results || p?.data || []);
            })
            .addCase(fetchPurchases.rejected, (state, action) => {
                state.loading.purchases = false;
                state.error = action.payload;
            })
            // Sales
            .addCase(fetchSales.pending, (state) => { state.loading.sales = true; })
            .addCase(fetchSales.fulfilled, (state, action) => {
                state.loading.sales = false;
                const p = action.payload;
                state.sales = Array.isArray(p) ? p : (p?.data?.results || p?.results || p?.data || []);
            })
            .addCase(fetchSales.rejected, (state, action) => {
                state.loading.sales = false;
                state.error = action.payload;
            })
            // Stock Movements
            .addCase(fetchStockMovements.pending, (state) => { state.loading.stockMovements = true; })
            .addCase(fetchStockMovements.fulfilled, (state, action) => {
                state.loading.stockMovements = false;
                const p = action.payload;
                state.stockMovements = Array.isArray(p) ? p : (p?.data?.results || p?.results || p?.data || []);
            })
            .addCase(fetchStockMovements.rejected, (state, action) => {
                state.loading.stockMovements = false;
                state.error = action.payload;
            });
    }
});

export default inventorySlice.reducer;
