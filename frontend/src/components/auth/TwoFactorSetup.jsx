import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { Smartphone, Key, Copy, Download, AlertCircle, Shield, CheckCircle, Eye, EyeOff, QrCode, Lock } from 'lucide-react'
import { authAPI } from '../../services/auth'
import toast from 'react-hot-toast'

const TwoFactorSetup = ({ onClose }) => {
  const [step, setStep] = useState('setup') // setup, verify, backup
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [showSecret, setShowSecret] = useState(false)

  const setupMutation = useMutation(authAPI.setupTwoFactor, {
    onSuccess: (data) => {
      setQrCode(data.data.data.qrCode)
      setSecret(data.data.data.secret)
      setStep('verify')
      toast.success('2FA setup initiated for your email marketing account!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA for email marketing platform')
    }
  })

  const enableMutation = useMutation(authAPI.enableTwoFactor, {
    onSuccess: (data) => {
      setBackupCodes(data.data.backupCodes)
      setStep('backup')
      toast.success('Two-factor authentication enabled for your email marketing account!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify 2FA code for email marketing account')
    }
  })

  const handleSetup = () => {
    setupMutation.mutate()
  }

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code')
      return
    }
    enableMutation.mutate({ token: verificationCode })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const downloadBackupCodes = () => {
    const content = `MailPilot Email Marketing Platform - Backup Codes\n${'='.repeat(50)}\n\nThese backup codes can be used to access your email marketing account\nif you lose access to your authenticator app.\n\nBackup Codes:\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nSecurity Instructions:\n• Keep these codes safe and secure\n• Treat them like passwords\n• Each code can only be used once\n• Store them in a secure location\n\nGenerated on: ${new Date().toLocaleDateString()}\nAccount: MailPilot Email Marketing Platform`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mailpilot-email-marketing-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded successfully!')
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
        <h1>Setup Two-Factor Authentication - MailPilot Email Marketing Security</h1>
        <p>Enable 2FA for your MailPilot email marketing account to secure your email campaigns, customer data, and marketing automation with advanced authentication.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-2xl mx-auto">
        <div className="p-8">
          {/* Step 1: Setup */}
          {step === 'setup' && (
            <div className="text-center space-y-8">
              {/* Header */}
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Secure Your Email Marketing Account
                </h3>
                <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Add an extra layer of security to protect your email campaigns, customer data, 
                  and marketing automation with two-factor authentication.
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-left">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Why Enable 2FA for Email Marketing?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Protect email campaign data</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Secure customer information</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Prevent unauthorized access</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Meet security compliance</span>
                  </div>
                </div>
              </div>
              
              {/* App Download Instructions */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-200 rounded-2xl p-6 text-left">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
                  Step 1: Download an Authenticator App
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h5 className="font-semibold text-slate-900 text-sm">Google Authenticator</h5>
                      <p className="text-xs text-slate-600">Most popular, works offline</p>
                      <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Recommended</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h5 className="font-semibold text-slate-900 text-sm">Microsoft Authenticator</h5>
                      <p className="text-xs text-slate-600">Cloud backup available</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h5 className="font-semibold text-slate-900 text-sm">Authy</h5>
                      <p className="text-xs text-slate-600">Multi-device sync</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <h5 className="font-semibold text-slate-900 text-sm">1Password</h5>
                      <p className="text-xs text-slate-600">If you use 1Password</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-4 text-center">
                  📱 Available free on iOS App Store and Google Play Store
                </p>
              </div>
              
              <button
                onClick={handleSetup}
                disabled={setupMutation.isLoading}
                className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-500 ${
                  setupMutation.isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'transform hover:-translate-y-1 focus:ring-4 focus:ring-blue-500/25'
                }`}
              >
                {setupMutation.isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span>Setting up 2FA...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="mr-3 h-5 w-5" />
                    <span>I have an authenticator app, continue</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Verify */}
          {step === 'verify' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 mb-6">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Connect Your Authenticator App
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Scan the QR code below to add your MailPilot email marketing account
                </p>
              </div>
              
              {/* Enhanced Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Step-by-Step Instructions
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Open your authenticator app on your phone</li>
                  <li>Tap "Add account", "+" button, or "Scan QR code"</li>
                  <li>Choose "Scan QR code" or "Scan barcode"</li>
                  <li>Point your camera at the QR code below</li>
                  <li>Enter the 6-digit code that appears in your app</li>
                </ol>
              </div>
              
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-2xl inline-block border-2 border-blue-200 shadow-lg">
                  <img 
                    src={qrCode} 
                    alt="QR Code for MailPilot Email Marketing 2FA Setup" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-slate-600 mt-3">
                  Scan this QR code with your authenticator app
                </p>
              </div>
              
              {/* Manual Entry Option */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h5 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Can't scan? Enter this code manually:
                </h5>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-300">
                  <code className={`text-sm font-mono ${showSecret ? 'block' : 'filter blur-sm'}`}>
                    {secret}
                  </code>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                      title={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(secret)}
                      className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Copy this code and add it manually in your authenticator app
                </p>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Enter the 6-digit code from your authenticator app:
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    className={`w-full py-4 px-4 text-center text-2xl font-mono tracking-wider border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25 bg-slate-50 hover:bg-white ${
                      verificationCode.length === 6
                        ? 'border-blue-500 focus:border-blue-600' 
                        : 'border-slate-200 focus:border-blue-500 hover:border-blue-300'
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    The code changes every 30 seconds
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStep('setup')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/25"
                  >
                    Back to Setup
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={enableMutation.isLoading || verificationCode.length !== 6}
                    className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
                      enableMutation.isLoading || verificationCode.length !== 6
                        ? 'bg-blue-300 text-blue-100 cursor-not-allowed border-2 border-blue-300'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-2 border-blue-500 hover:shadow-lg focus:ring-blue-500/25 transform hover:-translate-y-0.5'
                    }`}
                  >
                    {enableMutation.isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Verify & Enable 2FA</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 'backup' && (
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  2FA Successfully Enabled!
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Your email marketing account is now protected with two-factor authentication
                </p>
              </div>

              {/* Backup Codes Importance */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-2 rounded-xl flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-orange-800 font-bold text-lg mb-2">Important: Save Your Backup Codes</h4>
                    <p className="text-orange-700 mb-3">
                      These backup codes are your only way to access your email marketing account if you:
                    </p>
                    <ul className="text-sm text-orange-800 space-y-1 list-disc ml-5">
                      <li>Lose or break your phone</li>
                      <li>Can't access your authenticator app</li>
                      <li>Need to sign in from a new device</li>
                      <li>Your authenticator app stops working</li>
                    </ul>
                    <p className="text-sm text-orange-600 mt-3 font-semibold">
                      ⚠️ Each code can only be used once - treat them like passwords!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Backup Codes Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-blue-600" />
                  Your Backup Codes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <code className="font-mono text-sm text-slate-900">{code}</code>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h5 className="font-bold text-blue-900 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure Storage Recommendations
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Save in password manager</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Print and store securely</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Download as encrypted file</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Keep multiple copies</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadBackupCodes}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/25 flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Codes
                </button>
                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/25 flex items-center justify-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Codes
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transform hover:-translate-y-0.5"
                >
                  Complete Setup
                </button>
              </div>

              {/* Final Security Note */}
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">
                  🎉 Your MailPilot email marketing account is now secured with 2FA
                </p>
                <p className="text-xs text-slate-500">
                  You'll need your authenticator app or backup codes for future logins
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TwoFactorSetup
