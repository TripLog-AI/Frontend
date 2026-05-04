import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '../api';

const AuthGuard = ({ children }) => {
  const location = useLocation();
  if (!tokenStorage.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default AuthGuard;
