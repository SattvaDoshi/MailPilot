import React, { useState } from 'react'
import { Shield, ArrowLeft, Key, Clock, AlertCircle, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const TwoFactorVerify = ({ onBack }) => {
  const [code, setCode] = useState('')
  const [showBackupCodeInput, setShowBackupCodeInput] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(30)
  const { verifyTwoFactor, loading } = useAuth()

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 30))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const verificationCode = showBackupCodeInput ? backupCode : code
    
    if (!verificationCode) {
      toast.error('Please enter a verification code to access your email marketing account')
      return
    }

    if (!showBackupCodeInput && verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code')
      return
    }

    try {
      await verifyTwoFactor(verificationCode)
      toast.success('2FA verified! Accessing your email marketing dashboard...')
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error('Invalid verification code. Please check your authenticator app and try again.')
      } else {
        toast.error('Verification failed. Please try again to access your email marketing account.')
      }
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 6) {
      setCode(value)
    }
  }

  const handleBackupCodeChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (value.length <= 10) {
      setBackupCode(value)
    }
  }

  const toggleBackupCode = () => {
    setShowBackupCodeInput(!showBackupCodeInput)
    setCode('')
    setBackupCode('')
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Two-Factor Authentication Verification - MailPilot Email Marketing Login Security</h1>
        <p>Complete two-factor authentication to securely access your MailPilot email marketing dashboard. Verify your identity to protect your email campaigns and customer data.</p>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl"></div>
        
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-2xl">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">MailPilot</h1>
                  <p className="text-sm text-blue-600 font-medium">Email Marketing Platform</p>
                </div>
              </div>

              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Secure Access Verification
              </h2>
              <p className="text-lg text-slate-600 mb-2">
                Complete authentication to access your email marketing dashboard
              </p>
              <p className="text-sm text-slate-500">
                Enter the verification code from your authenticator app
              </p>

              {/* Security Indicators */}
              <div className="flex justify-center space-x-6 mt-6 text-sm text-slate-500">
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600 mr-1" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600 mr-1" />
                  <span>{timeRemaining}s</span>
                </div>
              </div>
            </div>

            {/* Enhanced Verification Form */}
            <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium text-sm">
                      {showBackupCodeInput ? 'Using Backup Code' : 'Using Authenticator App'}
                    </span>
                  </div>
                </div>

                {!showBackupCodeInput ? (
                  /* Authenticator Code Input */
                  <div>
                    <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                      Enter 6-digit verification code
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={code}
                      onChange={handleCodeChange}
                      className={`w-full py-4 px-4 text-center text-3xl font-mono tracking-wider border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                        code.length === 6
                          ? 'border-blue-500 focus:border-blue-600' 
                          : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <p className="text-slate-500">
                        Code refreshes every 30 seconds
                      </p>
                      <div className={`flex items-center ${timeRemaining <= 10 ? 'text-orange-600' : 'text-slate-500'}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-mono">{timeRemaining}s</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Backup Code Input */
                  <div>
                    <label htmlFor="backup-code" className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                      Enter backup recovery code
                    </label>
                    <input
                      id="backup-code"
                      name="backup-code"
                      type="text"
                      value={backupCode}
                      onChange={handleBackupCodeChange}
                      className={`w-full py-4 px-4 text-center text-xl font-mono tracking-wider border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                        backupCode.length >= 8
                          ? 'border-blue-500 focus:border-blue-600' 
                          : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                      }`}
                      placeholder="ABCD-EFGH"
                      maxLength={10}
                      required
                    />
                    <p className="text-sm text-slate-500 mt-3 text-center">
                      Enter one of your saved backup codes
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (!showBackupCodeInput && code.length !== 6) || (showBackupCodeInput && backupCode.length < 8)}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border ${
                    loading || (!showBackupCodeInput && code.length !== 6) || (showBackupCodeInput && backupCode.length < 8)
                      ? 'bg-blue-300 text-blue-100 cursor-not-allowed border-blue-300'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transform hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Verifying Access...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="mr-3 h-5 w-5" />
                      <span>Access Email Marketing Dashboard</span>
                    </div>
                  )}
                </button>

                {/* Backup Code Toggle */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleBackupCode}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors focus:outline-none focus:underline"
                  >
                    {showBackupCodeInput 
                      ? '← Use authenticator app instead' 
                      : 'Lost your device? Use backup code →'
                    }
                  </button>
                </div>

                {/* Back to Login */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/25 flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Email Marketing Login
                  </button>
                </div>
              </form>

              {/* Help Section */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-sm">
                      <h5 className="font-bold text-blue-900 mb-2">Need Help?</h5>
                      <ul className="text-blue-800 space-y-1 text-xs">
                        <li>• Check if your authenticator app time is synchronized</li>
                        <li>• Try refreshing your authenticator app</li>
                        <li>• Use a backup code if your device is unavailable</li>
                        <li>• Contact support for account recovery assistance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex justify-center space-x-6 mt-6 text-xs text-slate-400">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                    <span>Bank-Grade Security</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                    <span>SOC 2 Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Security Info */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">
                Protecting your email marketing campaigns and customer data
              </p>
              <p className="text-xs text-slate-400">
                This extra security step ensures only you can access your email marketing account
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TwoFactorVerify
