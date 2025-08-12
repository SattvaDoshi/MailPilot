import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Eye, EyeOff, Mail, Lock, User, Server, UserPlus, ArrowRight, Shield, Zap, CheckCircle, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email address is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  smtpEmail: yup.string().email('Please enter a valid SMTP email').required('SMTP email is required'),
  smtpPassword: yup.string().required('SMTP password is required'),
  smtpProvider: yup.string().required('Email provider is required')
})

const smtpProviders = [
  { value: 'gmail', label: 'Gmail', description: 'smtp.gmail.com' },
  { value: 'yahoo', label: 'Yahoo Mail', description: 'smtp.mail.yahoo.com' },
  { value: 'outlook', label: 'Outlook/Hotmail', description: 'smtp-mail.outlook.com' },
  { value: 'custom', label: 'Custom SMTP Server', description: 'Your own SMTP configuration' }
]

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const smtpProvider = watch('smtpProvider')

  const onSubmit = async (data) => {
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        smtpSettings: {
          provider: data.smtpProvider,
          email: data.smtpEmail,
          password: data.smtpPassword,
          ...(data.smtpProvider === 'custom' && {
            host: data.smtpHost,
            port: parseInt(data.smtpPort),
            secure: data.smtpSecure === 'true'
          })
        }
      }

      await registerUser(userData)
      navigate('/login')
    } catch (error) {
      // Error is handled in AuthContext
    }
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Create MailPilot Email Marketing Account - Start Your Email Campaign Journey</h1>
        <p>Sign up for MailPilot email marketing platform to create powerful email campaigns, automate customer journeys, and grow your business with advanced email marketing tools and analytics.</p>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl"></div>
        
        <div className="flex min-h-screen">
          {/* Left Side - Registration Form */}
          <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-2xl w-full space-y-8">
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
                  Start Your Email Marketing
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Success Story
                  </span>
                </h2>
                
                <p className="text-lg text-slate-600 mb-8">
                  Create your account and join 15,000+ successful email marketers
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-slate-500">
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600 mr-1" />
                    <span>Secure Signup</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Zap className="h-4 w-4 text-blue-600 mr-1" />
                    <span>Instant Setup</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Globe className="h-4 w-4 text-blue-600 mr-1" />
                    <span>Free Forever Plan</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Registration Form */}
              <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8">
                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-blue-100">
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Account Information
                      </h3>
                    </div>

                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          {...register('name')}
                          type="text"
                          className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                            errors.name 
                              ? 'border-red-400 focus:border-red-500' 
                              : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                          }`}
                          placeholder="Enter your full name for email marketing account"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          {...register('email')}
                          type="email"
                          className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                            errors.email 
                              ? 'border-red-400 focus:border-red-500' 
                              : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                          }`}
                          placeholder="Enter your email address for account login"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                              errors.password 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                            }`}
                            placeholder="Create secure password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 focus:outline-none transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            {...register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                              errors.confirmPassword 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                            }`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 focus:outline-none transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-blue-100" />
                    </div>
                  </div>

                  {/* SMTP Configuration Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-blue-100">
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <Server className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Email Configuration
                        </h3>
                        <p className="text-sm text-slate-600">Setup your SMTP for sending email campaigns</p>
                      </div>
                    </div>

                    {/* SMTP Provider */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Provider
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Server className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                          {...register('smtpProvider')}
                          className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                            errors.smtpProvider 
                              ? 'border-red-400 focus:border-red-500' 
                              : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                          }`}
                        >
                          <option value="">Select your email provider for campaigns</option>
                          {smtpProviders.map((provider) => (
                            <option key={provider.value} value={provider.value}>
                              {provider.label} - {provider.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.smtpProvider && (
                        <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {errors.smtpProvider.message}
                        </p>
                      )}
                    </div>

                    {/* SMTP Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          SMTP Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            {...register('smtpEmail')}
                            type="email"
                            className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                              errors.smtpEmail 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                            }`}
                            placeholder="your-email@domain.com"
                          />
                        </div>
                        {errors.smtpEmail && (
                          <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.smtpEmail.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          SMTP Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            {...register('smtpPassword')}
                            type={showSmtpPassword ? 'text' : 'password'}
                            className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                              errors.smtpPassword 
                                ? 'border-red-400 focus:border-red-500' 
                                : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                            }`}
                            placeholder="App password or SMTP password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 focus:outline-none transition-colors"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                          >
                            {showSmtpPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                          </button>
                        </div>
                        {errors.smtpPassword && (
                          <p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.smtpPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Custom SMTP Fields */}
                    {smtpProvider === 'custom' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                          <Server className="h-5 w-5 text-blue-600 mr-2" />
                          Custom SMTP Configuration
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              SMTP Host
                            </label>
                            <input
                              {...register('smtpHost')}
                              type="text"
                              className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 bg-white transition-all duration-200"
                              placeholder="smtp.yourprovider.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              SMTP Port
                            </label>
                            <input
                              {...register('smtpPort')}
                              type="number"
                              className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 bg-white transition-all duration-200"
                              placeholder="587"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Security Protocol
                          </label>
                          <select
                            {...register('smtpSecure')}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 bg-white transition-all duration-200"
                          >
                            <option value="false">STARTTLS (Port 587 - Recommended)</option>
                            <option value="true">SSL/TLS (Port 465)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-500 ${
                      loading 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/25'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        <span className="text-sm">Creating Your Email Marketing Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserPlus className="mr-3 h-5 w-5" />
                        <span className="text-sm font-bold">Create Email Marketing Account</span>
                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>

                  {/* Sign In Link */}
                  <div className="text-center pt-4 border-t border-blue-100">
                    <p className="text-sm text-slate-600">
                      Already have an email marketing account?{' '}
                      <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors focus:outline-none focus:underline"
                      >
                        Sign in to MailPilot
                      </Link>
                    </p>
                  </div>
                </form>
              </div>

              {/* Additional Features */}
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-500">
                  Join the email marketing revolution with MailPilot
                </p>
                
                <div className="flex justify-center space-x-6 text-xs text-slate-400">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>Free Setup</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>No Contracts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Benefits Showcase (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-center p-12 relative">
              <div className="max-w-lg text-white">
                <h3 className="text-4xl font-bold mb-8 text-center">
                  Start Your Email
                  <span className="block text-blue-200">Marketing Journey</span>
                </h3>
                
                <div className="space-y-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Powerful Email Campaigns</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          Create stunning email campaigns with our AI-powered template generator and advanced automation workflows.
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
                        <h4 className="font-bold text-lg mb-2">Enterprise Security</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          Your email data is protected with bank-grade security, SOC 2 compliance, and GDPR protection.
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
                        <h4 className="font-bold text-lg mb-2">Instant Results</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          Start sending professional email campaigns within minutes of signup with our quick setup wizard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block border border-white/20">
                    <p className="text-sm text-blue-100 mb-2">Trusted by email marketers at</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-200">
                      <span>• E-commerce Stores</span>
                      <span>• SaaS Companies</span>
                      <span>• Digital Agencies</span>
                      <span>• Content Creators</span>
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

export default RegisterForm
