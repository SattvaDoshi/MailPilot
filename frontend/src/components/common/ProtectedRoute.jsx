import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, requiresTwoFactor } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiresTwoFactor) {
    return <Navigate to="/verify-2fa" replace />
  }

  return children
}

export default ProtectedRoute
