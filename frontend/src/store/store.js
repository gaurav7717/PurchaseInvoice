// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slicers/authSlice';
import invoiceReducer from '../slicers/invoiceSlice';
import vendorReducer from '../slicers/vendorSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer,
    vendors: vendorReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});