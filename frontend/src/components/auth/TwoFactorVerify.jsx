import React, { useState } from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const TwoFactorVerify = ({ onBack }) => {
  const [code, setCode] = useState('')
  const { verifyTwoFactor, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await verifyTwoFactor(code)
    } catch (error) {
      // Error handled in context
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code from your authenticator app
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="sr-only">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="btn-secondary w-full flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Lost your device? Use a backup code instead.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorVerify
