import React, { useState } from 'react'
import { useMutation } from 'react-query'
import { Smartphone, Key, Copy, Download, AlertCircle } from 'lucide-react'
import { authAPI } from '../../services/auth'
import toast from 'react-hot-toast'

const TwoFactorSetup = ({ onClose }) => {
  const [step, setStep] = useState('setup') // setup, verify, backup
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])

  const setupMutation = useMutation(authAPI.setupTwoFactor, {
    onSuccess: (data) => {
      setQrCode(data.data.data.qrCode)
      setSecret(data.data.data.secret)
      setStep('verify')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA')
    }
  })

  const enableMutation = useMutation(authAPI.enableTwoFactor, {
    onSuccess: (data) => {
      setBackupCodes(data.data.backupCodes)
      setStep('backup')
      toast.success('Two-factor authentication enabled!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify code')
    }
  })

  const handleSetup = () => {
    setupMutation.mutate()
  }

  const handleVerify = () => {
    enableMutation.mutate({ token: verificationCode })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadBackupCodes = () => {
    const content = `MailPilot Backup Codes\n${'='.repeat(25)}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure!`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mailpilot-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {step === 'setup' && (
        <div className="text-center">
          <Smartphone className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Setup Two-Factor Authentication
          </h3>
          <p className="text-gray-600 mb-4">
            You'll need an authenticator app to generate security codes.
          </p>
          
          {/* ✅ Add app download instructions */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <h4 className="font-medium text-blue-900 mb-2">
              📱 First, download an authenticator app:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Google Authenticator</strong> (Recommended)</li>
              <li>• <strong>Microsoft Authenticator</strong></li>
              <li>• <strong>Authy</strong></li>
              <li>• <strong>1Password</strong> (if you use 1Password)</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Available free on iOS App Store and Google Play Store
            </p>
          </div>
          
          <button
            onClick={handleSetup}
            disabled={setupMutation.isLoading}
            className="btn-primary"
          >
            {setupMutation.isLoading ? 'Setting up...' : 'I have an authenticator app, continue'}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add MailPilot to your authenticator app
          </h3>
          
          {/* ✅ Enhanced instructions */}
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-yellow-900 mb-2">📱 Steps:</h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Open your authenticator app</li>
              <li>Tap "Add account" or "+" button</li>
              <li>Choose "Scan QR code"</li>
              <li>Point your camera at the QR code below</li>
              <li>Enter the 6-digit code generated in your app</li>
            </ol>
          </div>
          
          <div className="text-center mb-6">
            <div className="bg-white p-4 rounded-lg inline-block border">
              <img src={qrCode} alt="QR Code for MailPilot 2FA" className="w-48 h-48" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scan this QR code with your authenticator app
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Can't scan? Enter this code manually:
            </p>
            <div className="flex items-center justify-between bg-white p-2 rounded border">
              <code className="text-sm font-mono">{secret}</code>
              <button
                onClick={() => copyToClipboard(secret)}
                className="text-primary-600 hover:text-primary-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code from your authenticator app:
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="input-field text-center text-lg tracking-wider"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('setup')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={enableMutation.isLoading || verificationCode.length !== 6}
                className="btn-primary flex-1"
              >
                {enableMutation.isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'backup' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Save Your Backup Codes
          </h3>
          <p className="text-gray-600 mb-4">
            These backup codes can be used instead of your authenticator app if you:
          </p>
          
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Lose or break your phone</li>
              <li>Can't access your authenticator app</li>
              <li>Need to sign in without your phone</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2 font-medium">
              ⚠️ Keep these codes safe and secure - treat them like passwords!
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm bg-white p-2 rounded border">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={downloadBackupCodes}
              className="btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              className="btn-secondary flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </button>
            <button
              onClick={onClose}
              className="btn-primary flex-1"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TwoFactorSetup
