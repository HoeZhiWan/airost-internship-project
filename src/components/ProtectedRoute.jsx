// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase-client';
import { checkUserStatus } from '../lib/action';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth);
  const [userStatus, setUserStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userStatus) {
    return <LoadingScreen />;
  }
  
  if (!userStatus.emailVerified) {
    return <Navigate to="/confirm" replace />;
  }

  if (!userStatus.hasProfile && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  return <Outlet context={{ user, userStatus }} />;
};

export default ProtectedRoute;