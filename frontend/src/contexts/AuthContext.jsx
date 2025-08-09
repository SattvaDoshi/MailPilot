import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        requiresTwoFactor: false
      }
    case 'REQUIRE_TWO_FACTOR':
      return {
        ...state,
        requiresTwoFactor: true,
        tempCredentials: action.payload,
        loading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        requiresTwoFactor: false,
        tempCredentials: null,
        loading: false
      }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  requiresTwoFactor: false,
  tempCredentials: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken(token)
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await authAPI.getProfile(token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data,
          token
        }
      })
    } catch (error) {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authAPI.login(credentials)
      
      if (response.data.requiresTwoFactor) {
        dispatch({
          type: 'REQUIRE_TWO_FACTOR',
          payload: credentials
        })
        return { requiresTwoFactor: true }
      }

      const { token, user } = response.data
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const verifyTwoFactor = async (code) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authAPI.login({
        ...state.tempCredentials,
        twoFactorCode: code
      })

      const { token, user } = response.data
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Two-factor authentication successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await authAPI.register(userData)
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.success('Registration successful! Please verify your email.')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully!')
  }

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    verifyTwoFactor,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
