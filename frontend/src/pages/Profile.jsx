import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { User, Mail, Server, Shield, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import TwoFactorSetup from '../components/auth/TwoFactorVerify'
import Modal from '../components/common/Modal'
import toast from 'react-hot-toast'

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
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

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)

  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      smtpEmail: user?.smtpSettings?.email || '',
      smtpPassword: user?.smtpSettings?.password || '',
      smtpProvider: user?.smtpSettings?.provider || 'gmail',
      smtpHost: user?.smtpSettings?.host || '',
      smtpPort: user?.smtpSettings?.port || 587,
      smtpSecure: user?.smtpSettings?.secure ? 'true' : 'false'
    }
  })

  const smtpProvider = watch('smtpProvider')

  const updateProfileMutation = useMutation(authAPI.updateProfile, {
    onSuccess: (data) => {
      updateUser(data.data.data)
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  const testSmtpMutation = useMutation(authAPI.testSMTP, {
    onSuccess: () => {
      toast.success('SMTP settings are valid!')
      setTestingSmtp(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'SMTP test failed')
      setTestingSmtp(false)
    }
  })

  const onSubmit = (data) => {
    const updateData = {
      name: data.name,
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
    updateProfileMutation.mutate(updateData)
  }

  const handleTestSmtp = () => {
    const formData = watch()
    const smtpSettings = {
      provider: formData.smtpProvider,
      email: formData.smtpEmail,
      password: formData.smtpPassword,
      ...(formData.smtpProvider === 'custom' && {
        host: formData.smtpHost,
        port: parseInt(formData.smtpPort),
        secure: formData.smtpSecure === 'true'
      })
    }
    setTestingSmtp(true)
    testSmtpMutation.mutate(smtpSettings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and SMTP configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
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
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="input-field pl-10 bg-gray-50"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">SMTP Settings</h3>
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="btn-secondary text-sm"
                >
                  {testingSmtp ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              <div className="space-y-4">
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
                    <input
                      {...register('smtpPassword')}
                      type={showSmtpPassword ? 'text' : 'password'}
                      className="input-field pr-10"
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

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </>
                )}

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> For Gmail, use your app password instead of your regular password.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="btn-primary"
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => setTwoFactorModalOpen(true)}
                  className="btn-secondary text-sm"
                >
                  {user?.isTwoFactorEnabled ? 'Manage' : 'Setup'}
                </button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    Email verified: {user?.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Two-Factor:</span>
                <span className={user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600'}>
                  {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Modal */}
      <Modal
        isOpen={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title="Two-Factor Authentication"
        size="md"
      >
        <TwoFactorSetup onClose={() => setTwoFactorModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default Profile
