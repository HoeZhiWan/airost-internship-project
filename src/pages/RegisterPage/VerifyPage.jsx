import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const location = useLocation();
  const initialised = useRef(false);

  const verifyEmail = async () => {
    const query = new URLSearchParams(location.search);
    const oobCode = query.get('oobCode');

    if (oobCode) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/verify', 
        { method: 'POST', 
          headers: { 'Content-Type': 'application/json', }, 
          body: JSON.stringify({ oobCode }), 
        }); 

        const data = await response.json();
        setMessage(data.message);
        
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
  }, [location.search]);

  return <div>{message}</div>;
};

export default VerifyEmail;
