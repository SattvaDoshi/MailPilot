import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { Shield, Lock, Key, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authAPI } from '../../services/auth'
import toast from 'react-hot-toast'

const TwoFactorDisable = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const disableMutation = useMutation(authAPI.disableTwoFactor, {
    onSuccess: () => {
      toast.success('Two-factor authentication disabled successfully for your email marketing account!')
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA for your email marketing platform')
    }
  })

  const handleDisable = () => {
    if (!password || !verificationCode) {
      toast.error('Please fill in all fields to disable email marketing account 2FA')
      return
    }

    if (!confirmDisable) {
      toast.error('Please confirm that you want to disable 2FA for your email marketing account')
      return
    }

    disableMutation.mutate({
      password,
      token: verificationCode
    })
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 6) {
      setVerificationCode(value)
    }
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Disable Two-Factor Authentication - MailPilot Email Marketing Security Settings</h1>
        <p>Disable 2FA for your MailPilot email marketing account. Manage your email campaign security settings and authentication preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-lg mx-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 mb-6">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Disable Two-Factor Authentication
            </h3>
            <p className="text-slate-600 leading-relaxed">
              This will remove the extra security layer from your email marketing account. 
              Your campaigns and customer data will be less protected.
            </p>
          </div>

          {/* Enhanced Security Warning */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-2 rounded-xl flex-shrink-0">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="text-red-800 font-bold text-lg mb-2">Critical Security Warning</h4>
                <div className="text-red-700 text-sm space-y-2">
                  <p>
                    Disabling 2FA will significantly reduce your email marketing account security:
                  </p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Email campaigns and customer data at higher risk</li>
                    <li>Only password protection for account access</li>
                    <li>Increased vulnerability to unauthorized access</li>
                    <li>Potential compromise of email marketing campaigns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Enter Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                    password 
                      ? 'border-blue-500 focus:border-blue-600' 
                      : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                  }`}
                  placeholder="Enter your email marketing account password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 2FA Code Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current 2FA Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white text-center md:text-lg tracking-wider font-mono ${
                    verificationCode.length === 6
                      ? 'border-blue-500 focus:border-blue-600' 
                      : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                  }`}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div className="mt-2 text-sm text-slate-500 space-y-1">
                <p>Enter the 6-digit code from your authenticator app</p>
                <p className="text-xs">You can also use a backup code if available</p>
              </div>
            </div>

            {/* Enhanced Confirmation Checkbox */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5 mt-1">
                  <input
                    id="confirm-disable"
                    type="checkbox"
                    checked={confirmDisable}
                    onChange={(e) => setConfirmDisable(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-4 focus:ring-blue-500/25 transition-all duration-200"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="confirm-disable" className="font-bold text-slate-900 cursor-pointer">
                    I understand the security implications
                  </label>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    I want to disable two-factor authentication for my email marketing account and 
                    understand this will make my campaigns, customer data, and account access less secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <h5 className="font-bold text-blue-900 mb-2">Security Recommendations</h5>
                  <ul className="text-blue-800 space-y-1 text-xs">
                    <li>• Use a strong, unique password for your email marketing account</li>
                    <li>• Enable account notifications for login attempts</li>
                    <li>• Regularly monitor your email campaign activities</li>
                    <li>• Consider re-enabling 2FA for better protection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/25"
            >
              Cancel & Keep 2FA
            </button>
            <button
              onClick={handleDisable}
              disabled={disableMutation.isLoading || !password || !verificationCode || !confirmDisable}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
                disableMutation.isLoading || !password || !verificationCode || !confirmDisable
                  ? 'bg-red-300 text-red-100 cursor-not-allowed border-2 border-red-300'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-2 border-red-500 hover:shadow-lg focus:ring-red-500/25'
              }`}
            >
              {disableMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-sm">Disabling 2FA...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span className="text-sm">Disable 2FA Security</span>
                </div>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">
              Need help with your email marketing account security?
            </p>
            <div className="flex justify-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                <span>Security Docs</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                <span>Best Practices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TwoFactorDisable
