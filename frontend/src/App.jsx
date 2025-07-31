// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import EmailVerification from './components/auth/EmailVerification';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <LoginForm /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <RegisterForm /> : <Navigate to="/" replace />} 
      />
      <Route path="/verify-email" element={<EmailVerification />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/groups" element={
        <ProtectedRoute>
          <Layout>
            <Groups />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/templates" element={
        <ProtectedRoute>
          <Layout>
            <Templates />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/campaigns" element={
        <ProtectedRoute>
          <Layout>
            <Campaigns />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster position="top-right" />
          </div>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
