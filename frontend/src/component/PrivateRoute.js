import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PrivateRoute({ children, ...rest }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Assuming this is your auth state

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" replace /> // Redirect to login if not authenticated
  );
}

export default PrivateRoute;