import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = () => {
  const { user, userStatus } = useAuth();
  const location = useLocation();

  if (user && userStatus === null) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userStatus) {
    if (!userStatus.emailVerified) {
      return <Navigate to="/confirm" replace />;
    }
    if (!userStatus.hasProfile) {
      return <Navigate to="/setup-profile" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;