import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap, CheckCircle } from 'lucide-react'
import TwoFactorVerify from './TwoFactorVerify'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email address').required('Email address is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

const Login = () => {
  const { login, requiresTwoFactor, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    resolver: yupResolver(loginSchema)
  })

  const onSubmit = async (data, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    clearErrors()
    setIsSubmitting(true)

    try {
      const result = await login(data)

      if (result?.requiresTwoFactor) {
        setIsSubmitting(false)
        return
      }

      if (result?.success) {
        toast.success('Welcome back! Redirecting to your email marketing dashboard...')
        setIsSubmitting(false)
        return
      }

    } catch (error) {
      console.error('Email marketing platform login error:', error)
      setIsSubmitting(false)

      if (error?.response?.status === 401) {
        setError('email', {
          type: 'manual',
          message: 'Invalid email or password for your email marketing account'
        })
        setError('password', {
          type: 'manual',
          message: 'Invalid email or password for your email marketing account'
        })
        toast.error('Invalid email marketing credentials')
      } else if (error?.response?.status === 422) {
        const validationErrors = error.response.data?.errors || {}
        Object.keys(validationErrors).forEach(field => {
          setError(field, {
            type: 'manual',
            message: validationErrors[field][0] || 'Invalid input'
          })
        })
        toast.error('Please check your email marketing account details')
      } else if (error?.response?.status === 429) {
        toast.error('Too many login attempts. Please try again later to access your email marketing dashboard.')
      } else if (error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection and try accessing your email marketing platform again.')
      } else {
        toast.error(error?.message || 'Login failed. Please try again to access MailPilot email marketing platform.')
      }
    }
  }

  const handleFormSubmit = (data, event) => {
    if (event?.preventDefault) {
      event.preventDefault()
    }
    if (event?.stopPropagation) {
      event.stopPropagation()
    }

    onSubmit(data, event)
  }

  if (requiresTwoFactor) {
    return <TwoFactorVerify onBack={() => {
      window.history.back()
    }} />
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>MailPilot Email Marketing Platform Login - Access Your Email Campaign Dashboard</h1>
        <p>Sign in to your MailPilot email marketing account to create, manage, and track powerful email campaigns. Access advanced email automation tools, analytics, and customer segmentation features.</p>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl"></div>

        <div className="flex min-h-screen">
          {/* Left Side - Login Form */}
          <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-md w-full space-y-8">
              {/* Header */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-2xl">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">MailPilot</h1>
                    <p className="text-sm text-blue-600 font-medium">Email Marketing Platform</p>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Welcome Back to Your
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Email Marketing Hub
                  </span>
                </h2>

                <p className="text-lg text-slate-600 mb-8">
                  Sign in to access your email campaigns, analytics, and automation tools
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-slate-500">
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600 mr-1" />
                    <span>Secure Login</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Zap className="h-4 w-4 text-blue-600 mr-1" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Login Form */}
              {/* Enhanced Login Form - Compact Version */}
              <form
                className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 space-y-6"
                onSubmit={handleSubmit(handleFormSubmit)}
                noValidate
              >
                <div className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        {...register('email')}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${errors.email
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                          }`}
                        placeholder="Enter your email marketing account email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        {...register('password')}
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${errors.password
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                          }`}
                        placeholder="Enter your account password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 focus:outline-none transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowPassword(!showPassword)
                        }}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* General Error Message */}
                {(errors.root || errors.general) && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <div className="text-sm text-red-700 font-medium">
                      {errors.root?.message || errors.general?.message || 'Please check your email marketing account credentials and try again.'}
                    </div>
                  </div>
                )}

                {/* Submit Button - Also made more compact */}
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className={`group w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-500 ${(loading || isSubmitting)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/25'
                    }`}
                >
                  {loading || isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                      <span className="text-sm">Accessing Your Dashboard...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-semibold">Access Email Marketing Dashboard</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>

                {/* Links */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-200">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors focus:outline-none focus:underline"
                  >
                    Forgot your password?
                  </Link>

                  <div className="text-sm text-slate-600">
                    New to email marketing?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors focus:outline-none focus:underline"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              </form>


              {/* Additional Features */}
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-500">
                  Trusted by 15,000+ email marketers worldwide
                </p>

                <div className="flex justify-center space-x-6 text-xs text-slate-400">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>99.9% Uptime</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>SOC 2 Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features Showcase (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>

            <div className="flex items-center justify-center p-12 relative">
              <div className="max-w-lg text-white">
                <h3 className="text-4xl font-bold mb-8 text-center">
                  Access Your Email
                  <span className="block text-blue-200">Marketing Command Center</span>
                </h3>

                <div className="space-y-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Campaign Management</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          Create, schedule, and manage sophisticated email marketing campaigns with advanced automation workflows.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Advanced Analytics</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          Track email performance, conversion rates, and customer engagement with comprehensive analytics dashboard.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">AI-Powered Tools</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          Generate high-converting email templates and optimize your campaigns using artificial intelligence.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block border border-white/20">
                    <p className="text-sm text-blue-100 mb-2">Trusted by email marketers at</p>
                    <div className="flex space-x-4 text-xs text-blue-200">
                      <span>• Fortune 500</span>
                      <span>• Startups</span>
                      <span>• Agencies</span>
                      <span>• E-commerce</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
