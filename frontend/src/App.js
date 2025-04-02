import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './slicers/authSlice';
import PrivateRoute from '../src/component/PrivateRoute'; // Ensure this is the correct path

import LoginPage from './pages/LoginPage';
import InvoiceList from './pages/InvoiceList';
import CreateInvoice from './pages/CreateInvoice';
import { VendorList } from './pages/VendorList';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/invoices"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <InvoiceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <CreateInvoice />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
             <VendorList/>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
