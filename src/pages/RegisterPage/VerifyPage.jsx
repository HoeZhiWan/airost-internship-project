import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../../firebase-client';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const location = useLocation();
  const initialised = useRef(false);

  const verifyEmail = async () => {
    const query = new URLSearchParams(location.search);
    const oobCode = query.get('oobCode');

    if (oobCode) {
      try {
        const response = await applyActionCode(auth, oobCode);
        setMessage('Email verified successfully!');

        // need to update email system
        // console.log(auth);

        // await fetch('http://localhost:3000/api/auth/verified', 
        // { method: 'POST', 
        //       headers: { 'Content-Type': 'application/json', }, 
        //       body: JSON.stringify({ idToken }), 
        // }); 

      } catch (error) {
          console.error('Error verifying email:', error);
          setMessage('Error verifying email.');
        }
    } else {
      setMessage('Invalid verification link.');
    }
  };

  useEffect(() => {
    if (!initialised.current) {
        initialised.current = true;
        verifyEmail();
    }
  }, [location.search, auth]);

  return <div>{message}</div>;
};

export default VerifyEmail;
