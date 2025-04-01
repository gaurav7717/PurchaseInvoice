import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/invoices/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch invoices');
    }
  }
);

export const getInvoiceById = createAsyncThunk(
  'invoices/getById',
  async (invoiceId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch invoice');
    }
  }
);

export const uploadInvoice = createAsyncThunk(
  'invoices/upload',
  async (file, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_URL}/upload-pdf/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Upload failed');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (invoiceData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/invoices/`, invoiceData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ invoiceId, updateData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(
        `${API_URL}/invoices/${invoiceId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Update failed');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (invoiceId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_URL}/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return invoiceId;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Delete failed');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    currentInvoice: null,
    loading: false,
    error: null,
    uploadStatus: 'idle',
    saveStatus: 'idle', // Added for createInvoice
  },
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch invoices';
      })
      
      // Get Invoice by ID
      .addCase(getInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch invoice';
      })
      
      // Upload Invoice
      .addCase(uploadInvoice.pending, (state) => {
        state.uploadStatus = 'loading';
        state.error = null;
      })
      .addCase(uploadInvoice.fulfilled, (state) => {
        state.uploadStatus = 'succeeded';
      })
      .addCase(uploadInvoice.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload?.detail || 'Upload failed';
      })
      
      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.saveStatus = 'loading';
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.invoices.push(action.payload.invoice);
        state.currentInvoice = { invoice: action.payload.invoice, items: action.payload.items };
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload?.detail || 'Failed to create invoice';
      })
      
      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.map(invoice =>
          invoice.id === action.payload.invoice.id ? action.payload.invoice : invoice
        );
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Update failed';
      })
      
      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(
          invoice => invoice.id !== action.payload
        );
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Delete failed';
      });
  }
});

export const { clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;