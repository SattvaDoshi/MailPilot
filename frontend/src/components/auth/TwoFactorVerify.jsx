import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const TwoFactorVerify = () => {
  const { verifyTwoFactor, loading } = useAuth()
  const [code, setCode] = useState(['', '', '', '', '', ''])

  const {
    handleSubmit,
    formState: { errors }
  } = useForm()

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        if (nextInput) nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const onSubmit = async () => {
    const fullCode = code.join('')
    if (fullCode.length === 6) {
      try {
        await verifyTwoFactor(fullCode)
      } catch (error) {
        // Error is handled in AuthContext
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorVerify
