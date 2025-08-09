import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Eye, EyeOff, Mail, Lock, User, Server } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  smtpEmail: yup.string().email('Invalid email').required('SMTP email is required'),
  smtpPassword: yup.string().required('SMTP password is required'),
  smtpProvider: yup.string().required('SMTP provider is required')
})

const smtpProviders = [
  { value: 'gmail', label: 'Gmail' },
  { value: 'yahoo', label: 'Yahoo' },
  { value: 'outlook', label: 'Outlook' },
  { value: 'custom', label: 'Custom SMTP' }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* SMTP Settings */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Provider
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Server className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register('smtpProvider')}
                    className="input-field pl-10"
                  >
                    <option value="">Select SMTP Provider</option>
                    {smtpProviders.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.smtpProvider && (
                  <p className="mt-1 text-sm text-red-600">{errors.smtpProvider.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('smtpEmail')}
                    type="email"
                    className="input-field pl-10"
                    placeholder="Your SMTP email"
                  />
                </div>
                {errors.smtpEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.smtpEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('smtpPassword')}
                    type={showSmtpPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="Your SMTP password or app password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  >
                    {showSmtpPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.smtpPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.smtpPassword.message}</p>
                )}
              </div>

              {/* Custom SMTP Fields */}
              {smtpProvider === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Host
                    </label>
                    <input
                      {...register('smtpHost')}
                      type="text"
                      className="input-field"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Port
                    </label>
                    <input
                      {...register('smtpPort')}
                      type="number"
                      className="input-field"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Secure Connection
                    </label>
                    <select
                      {...register('smtpSecure')}
                      className="input-field"
                    >
                      <option value="false">No (STARTTLS)</option>
                      <option value="true">Yes (SSL/TLS)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>💡 <strong>Tip:</strong> For Gmail, use your app password instead of your regular password.</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
