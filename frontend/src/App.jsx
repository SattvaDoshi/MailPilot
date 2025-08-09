import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail' // Add this import
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import Templates from './pages/Templates'
import EmailCampaigns from './pages/EmailCampaigns'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Subscription from './pages/Subscription'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} /> {/* Add this route */}
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="groups" element={<Groups />} />
          <Route path="templates" element={<Templates />} />
          <Route path="campaigns" element={<EmailCampaigns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
