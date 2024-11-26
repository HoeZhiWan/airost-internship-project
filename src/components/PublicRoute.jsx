// PublicRoute.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase-client';
import { checkUserStatus } from '../lib/action';
import LoadingScreen from './LoadingScreen';

const PublicRoute = () => {
  const [user, loading] = useAuthState(auth);
  const [userStatus, setUserStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    async function fetchUserStatus() {
      if (user) {
        try {
          const idToken = await auth.currentUser?.getIdToken();
          const status = await checkUserStatus(idToken);
          setUserStatus(status);
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }
      setCheckingStatus(false);
    }

    fetchUserStatus();
  }, [user]);

  if (loading || checkingStatus) {
    return <LoadingScreen />;
  }

  // If user is authenticated, handle redirections
  if (user && userStatus) {
    const isAuthPath = path === '/login' || path === '/register';
    
    if (!userStatus.emailVerified) {
      return isAuthPath ? <Navigate to="/confirm" replace /> : <Outlet />;
    }
    
    if (!userStatus.hasProfile) {
      return (path !== '/setup-profile') ? <Navigate to="/setup-profile" replace /> : <Outlet />;
    }
    
    return <Navigate to="/profile" replace />;
  }

  // Allow access to public routes for non-authenticated users
  return <Outlet />;
};

export default PublicRoute;