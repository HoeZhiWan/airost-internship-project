import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const PublicRoute = () => {
  const { user, userStatus, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && userStatus) {
    if (!userStatus.emailVerified) {
      return path === '/confirm' ? <Outlet /> : <Navigate to="/confirm" replace />;
    }
    
    if (!userStatus.hasProfile) {
      return path === '/setup-profile' ? <Outlet /> : <Navigate to="/setup-profile" replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;