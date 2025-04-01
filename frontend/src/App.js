import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InvoiceList from './pages/InvoiceList';
import CreateInvoice from './pages/CreateInvoice';
import Vendors from './pages/Vendors';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './slicers/authSlice';
import PrivateRoute from '../src/component/PrivateRoute'; // Assuming you created the PrivateRoute component

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
            <PrivateRoute>
              <InvoiceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateInvoice />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <PrivateRoute>
              <Vendors />
            </PrivateRoute>
          }
        />
        {/* You can add more public routes here */}
      </Routes>
    </div>
  );
}

export default App;