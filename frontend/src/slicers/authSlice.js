import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Check if token exists and is valid
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        return { isAuthenticated: false };
      }

      // Optionally verify the token with your backend
      // For example:
      // const response = await axios.get(`${API_URL}/verify-token`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // return { isAuthenticated: true, userData: response.data };

      // If you don't have a verify endpoint, just return authenticated
      return { isAuthenticated: true };
    } catch (err) {
      localStorage.removeItem('access_token');
      return rejectWithValue(err.response?.data || 'Token validation failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/token`, `username=${username}&password=${password}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('access_token'), // Keep token in state for potential use
    isAuthenticated: false, // Initialize to false
    loading: true, // Start with loading true
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token');
      state.token = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;