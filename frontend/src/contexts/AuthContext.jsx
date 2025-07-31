// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'LOGOUT':
      return { user: null, token: null, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch({ type: 'SET_TOKEN', payload: token });
      fetchUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      dispatch({ type: 'SET_USER', payload: response.data.user });
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    dispatch({ type: 'SET_TOKEN', payload: token });
    dispatch({ type: 'SET_USER', payload: user });
    
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const verifyEmail = async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  };

  const resendVerification = async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  };

  return (
    <AuthContext.Provider value={{
      user: state.user,
      token: state.token,
      loading: state.loading,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
