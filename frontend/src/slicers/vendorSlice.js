// vendorSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial demo data
const demoVendors = [
  {
    id: 1,
    vendor_name: 'Tech Supplies Inc',
    phone_number: '5551234567',
    email: 'contact@techsupplies.com',
    address: '123 Tech Street',
    city: 'Boston',
    state: 'Massachusetts',
    state_code: 'MA',
    zipcode: '02108',
    license_number: 'LIC001',
    associated_brands: ['BrandA', 'BrandB']
  },
  {
    id: 2,
    vendor_name: 'Office Solutions Ltd',
    phone_number: '5559876543',
    email: 'sales@officesolutions.com',
    address: '456 Business Ave',
    city: 'New York',
    state: 'New York',
    state_code: 'NY',
    zipcode: '10001',
    license_number: 'LIC002',
    associated_brands: ['BrandC']
  },
  {
    id :3,
    vendor_name: "ABC Enterprises GreenLeaf Organics Pvt. Ltd."
  }
];

const vendorSlice = createSlice({
  name: 'vendors',
  initialState: {
    vendors: demoVendors,
    loading: false,
    error: null
  },
  reducers: {
    // Add a new vendor
    addVendor: (state, action) => {
      state.vendors.push(action.payload);
    },
    
    // Update an existing vendor
    updateVendor: (state, action) => {
      const index = state.vendors.findIndex(
        vendor => vendor.id === action.payload.id
      );
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
    },
    
    // Delete a vendor
    deleteVendor: (state, action) => {
      state.vendors = state.vendors.filter(
        vendor => vendor.id !== action.payload
      );
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

// Export actions
export const { 
  addVendor, 
  updateVendor, 
  deleteVendor, 
  setLoading, 
  setError 
} = vendorSlice.actions;

// Export selectors
export const selectVendors = (state) => state.vendors.vendors;
export const selectLoading = (state) => state.vendors.loading;
export const selectError = (state) => state.vendors.error;

// Export reducer
export default vendorSlice.reducer;