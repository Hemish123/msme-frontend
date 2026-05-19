import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCustomerDropdown } from '../api/customerAPI';
import { createInvoiceCustomer } from '../api/invoiceCustomerAPI';
import { getInventoryDropdown, createProduct } from '../api/inventoryAPI';
import { getInvoices, createInvoice, getNextInvoiceNumber, getInvoiceStats } from '../api/invoiceAPI';

// ── Async thunks ──────────────────────────────────────────────────

export const fetchInvoiceCustomers = createAsyncThunk(
  'invoices/fetchInvoiceCustomers',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getCustomerDropdown();
    if (error) return rejectWithValue(error);
    return data.data || data;
  }
);

export const addInvoiceCustomer = createAsyncThunk(
  'invoices/addInvoiceCustomer',
  async (formData, { rejectWithValue }) => {
    const { data, error } = await createInvoiceCustomer(formData);
    if (error) return rejectWithValue(error);
    return data;
  }
);

export const fetchInventory = createAsyncThunk(
  'invoices/fetchInventory',
  async (customerId, { rejectWithValue }) => {
    const { data, error } = await getInventoryDropdown(customerId);
    if (error) return rejectWithValue(error);
    return data;
  }
);

export const addInventoryItem = createAsyncThunk(
  'invoices/addInventoryItem',
  async (formData, { rejectWithValue }) => {
    const { data, error } = await createProduct(formData);
    if (error) return rejectWithValue(error);
    return data;
  }
);

export const fetchNextNumber = createAsyncThunk(
  'invoices/fetchNextNumber',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getNextInvoiceNumber();
    if (error) return rejectWithValue(error);
    return data.invoice_number;
  }
);

export const submitInvoice = createAsyncThunk(
  'invoices/submitInvoice',
  async (formData, { rejectWithValue }) => {
    const { data, error } = await createInvoice(formData);
    if (error) return rejectWithValue(error);
    return data;
  }
);

export const fetchInvoiceList = createAsyncThunk(
  'invoices/fetchInvoiceList',
  async (params, { rejectWithValue }) => {
    const { data, error } = await getInvoices(params);
    if (error) return rejectWithValue(error);
    return data;
  }
);

export const fetchInvoiceStats = createAsyncThunk(
  'invoices/fetchInvoiceStats',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getInvoiceStats();
    if (error) return rejectWithValue(error);
    return data;
  }
);

// ── Slice ─────────────────────────────────────────────────────────

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoiceCustomers: [],
    inventory: [],
    invoices: [],
    nextInvoiceNumber: '',
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch invoice customers
    builder
      .addCase(fetchInvoiceCustomers.pending, (state) => { state.loading = true; })
      .addCase(fetchInvoiceCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.invoiceCustomers = action.payload;
      })
      .addCase(fetchInvoiceCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add invoice customer
    builder
      .addCase(addInvoiceCustomer.pending, (state) => { state.loading = true; })
      .addCase(addInvoiceCustomer.fulfilled, (state) => { state.loading = false; })
      .addCase(addInvoiceCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch inventory
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add inventory item
    builder
      .addCase(addInventoryItem.pending, (state) => { state.loading = true; })
      .addCase(addInventoryItem.fulfilled, (state) => { state.loading = false; })
      .addCase(addInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch next number
    builder
      .addCase(fetchNextNumber.fulfilled, (state, action) => {
        state.nextInvoiceNumber = action.payload;
      });

    // Submit invoice
    builder
      .addCase(submitInvoice.pending, (state) => { state.loading = true; })
      .addCase(submitInvoice.fulfilled, (state) => { state.loading = false; })
      .addCase(submitInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch invoice list
    builder
      .addCase(fetchInvoiceList.fulfilled, (state, action) => {
        state.invoices = action.payload;
      });

    // Fetch stats
    builder
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
