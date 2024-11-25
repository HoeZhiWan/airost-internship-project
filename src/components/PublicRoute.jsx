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

  useEffect(() => {
    async function fetchUserStatus() {
      if (user) {
        try {
          const idToken = await auth.currentUser?.getIdToken();
          const status = await checkUserStatus(idToken);
          setUserStatus(status);
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

  console.log(userStatus);

  if (user && userStatus) {
    if (!userStatus.emailVerified) {
      return <Navigate to="/confirm" />;
    }

    if (!userStatus.hasProfile && location.pathname !== '/setup-profile') {
      return <Navigate to="/setup-profile" />;
    }

    if (userStatus.emailVerified && userStatus.hasProfile) {
      return <Navigate to="/profile" />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;