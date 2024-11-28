
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase-client';
import { checkUserStatus } from '../lib/action';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({ children }) {
  const [user, loading] = useAuthState(auth);
  const [userStatus, setUserStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUserStatus() {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!mounted) return;

        const status = await checkUserStatus(idToken);
        if (!mounted) return;

        setUserStatus(status);
        setCheckingStatus(false);
      } catch (error) {
        console.error('Error checking status:', error);
        if (mounted) {
          setCheckingStatus(false);
        }
      }
    }

    setCheckingStatus(true);
    fetchUserStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading || checkingStatus) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, userStatus }}>
      {children}
    </AuthContext.Provider>
  );
}