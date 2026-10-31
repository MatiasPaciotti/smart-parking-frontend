import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, token } = useSelector((state) => state.auth);
  const currentToken = token || localStorage.getItem('token');

  if (!currentToken) {
    return <Navigate to="/" replace />;
  }

  let currentRole = user?.role;
  if (!currentRole) {
    try {
      const saved = JSON.parse(localStorage.getItem('user'));
      currentRole = saved?.role;
    } catch (err) {
      currentRole = null;
    }
  }

  if (!currentRole) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(currentRole);

    if (!isAllowed) {
      if (currentRole === 'user') {
        return <Navigate to="/dashboard" replace />;
      }
      if (currentRole === 'admin') {
        return <Navigate to="/guard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
}