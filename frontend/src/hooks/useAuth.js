// src/hooks/useAuth.js
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();
  const [userRegistered, setUserRegistered] = useState(false);

  useEffect(() => {
    const registerUser = async () => {
      if (isLoaded && isSignedIn && user && !userRegistered) {
        try {
          await api.post('/auth/register', {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          });
          setUserRegistered(true);
        } catch (error) {
          // User might already exist, which is fine
          if (error.response?.status !== 409) {
            console.error('User registration error:', error);
          }
          setUserRegistered(true);
        }
      }
    };

    registerUser();
  }, [isLoaded, isSignedIn, user, userRegistered]);

  return {
    isLoaded,
    isSignedIn,
    user,
    signOut,
    loading: !isLoaded,
  };
};

export default useAuth;
