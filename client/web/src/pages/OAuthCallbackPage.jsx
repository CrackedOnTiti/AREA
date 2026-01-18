import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

const OAuthCallbackPage = () =>
{
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing...');

  useEffect(() =>
  {
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    if (error)
    {
      setMessage(`Failed: ${error}`);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    else if (token)
    {
      setMessage(`Login successful! Welcome.`);

      localStorage.setItem('token', token);

      getCurrentUser()
        .then(() => {
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        })
        .catch((err) => {
          setMessage(`Failed to fetch user data: ${err.message}`);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        });
    }
    else
    {
      setMessage('Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="border-2 border-white px-3 py-3 mb-8 inline-block">
          <div className="text-white text-3xl font-bold leading-tight">AR</div>
          <div className="text-white text-3xl font-bold leading-tight">EA</div>
        </div>

        <div className="mb-6">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>

        <p className="text-white text-xl mb-2">{message}</p>
        <p className="text-gray-400">You will be redirected shortly...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
