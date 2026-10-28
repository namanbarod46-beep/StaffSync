import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Verifying StaffSync credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard based on their role
    if (user.role === 'hr') {
      return <Navigate to="/dashboard/hr" replace />;
    } else if (user.role === 'manager') {
      return <Navigate to="/dashboard/manager" replace />;
    } else {
      return <Navigate to="/dashboard/employee" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
