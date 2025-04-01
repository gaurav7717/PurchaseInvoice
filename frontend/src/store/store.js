// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slicers/authSlice';
import invoiceReducer from '../slicers/invoiceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});