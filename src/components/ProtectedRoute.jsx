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

  if (!user || !userStatus?.emailVerified || !userStatus?.hasProfile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ user, userStatus }} />;
};

export default ProtectedRoute;