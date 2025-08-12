import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react'
import { authAPI } from '../../services/auth'
import toast from 'react-hot-toast'

const TwoFactorDisable = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmDisable, setConfirmDisable] = useState(false)

  const disableMutation = useMutation(authAPI.disableTwoFactor, {
    onSuccess: () => {
      toast.success('Two-factor authentication disabled successfully!')
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA')
    }
  })

  const handleDisable = () => {
    if (!password || !verificationCode) {
      toast.error('Please fill in all fields')
      return
    }

    if (!confirmDisable) {
      toast.error('Please confirm that you want to disable 2FA')
      return
    }

    disableMutation.mutate({
      password,
      token: verificationCode
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Disable Two-Factor Authentication
        </h3>
        <p className="text-gray-600">
          This will remove the extra security layer from your account.
        </p>
      </div>

      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">Security Warning</h4>
            <p className="text-red-700 text-sm mt-1">
              Disabling 2FA will make your account less secure. You'll only need 
              your password to sign in, which could be compromised.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your password to confirm
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter your account password"
            />
          </div>
        </div>

        {/* 2FA Code Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter current 2FA code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="input-field pl-10 text-center text-lg tracking-wider"
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code from your authenticator app or use a backup code
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="confirm-disable"
              type="checkbox"
              checked={confirmDisable}
              onChange={(e) => setConfirmDisable(e.target.checked)}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="confirm-disable" className="font-medium text-gray-700">
              I understand the security implications
            </label>
            <p className="text-gray-500">
              I want to disable two-factor authentication and understand this will 
              make my account less secure.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={onClose}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleDisable}
          disabled={disableMutation.isLoading || !password || !verificationCode || !confirmDisable}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex-1"
        >
          {disableMutation.isLoading ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    </div>
  )
}

export default TwoFactorDisable
