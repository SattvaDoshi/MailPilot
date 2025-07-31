// src/components/auth/EmailVerification.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import Button from '../ui/Button';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      const result = await verifyEmail(token);
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      await resendVerification(email);
      setMessage('Verification email sent successfully!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-lg shadow">
          {status === 'verifying' && (
            <>
              <Mail className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Verifying Email</h2>
              <p className="mt-2 text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <Link 
                to="/login" 
                className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-3">
                  Didn't receive the email? Enter your email to resend:
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                />
                <Button onClick={handleResendVerification} className="w-full">
                  Resend Verification
                </Button>
              </div>

              <Link to="/login" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
