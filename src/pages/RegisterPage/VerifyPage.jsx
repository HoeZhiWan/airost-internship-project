import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const initialised = useRef(false);

  const verifyEmail = async () => {
    const query = new URLSearchParams(location.search);
    const oobCode = query.get('oobCode');

    if (oobCode) {
      try {
        setIsLoading(true);

        const response = await fetch('http://localhost:3000/api/auth/verify', 
        { method: 'POST', 
          headers: { 'Content-Type': 'application/json', }, 
          body: JSON.stringify({ oobCode }), 
        }); 

        const data = await response.json();
        setMessage(data.message);

        if (response.ok) {
          setMessage("Redirecting...");
          setTimeout(() => {
            navigate('/login'); 
          }, 3000); 
        }
        
      } catch (error) {
          console.error('Error verifying email:', error);
          setMessage('Error verifying email.');
        } finally {
          setIsLoading(false);
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

  return (
    <>
      <div>{message}</div>
      {isLoading && <div>Please wait...</div>}
    </>
  );
};

export default VerifyEmail;
