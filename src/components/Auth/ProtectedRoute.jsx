import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('ulip_user_role') || 'user';
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user's role is not in the allowed list, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
