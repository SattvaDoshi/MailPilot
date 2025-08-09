import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { authAPI } from '../services/auth'

const VerifyEmail = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('Verifying token:', token)
        const response = await authAPI.verifyEmail(token)
        setStatus('success')
        setMessage(response.data.message)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage(error.response?.data?.message || 'Email verification failed')
      }
    }

    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('Invalid verification link')
    }
  }, [token, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verifying your email...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Email Verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verification Failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
