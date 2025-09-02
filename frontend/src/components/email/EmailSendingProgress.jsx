// src/components/email/EmailSendingProgress.jsx
import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const EmailSendingProgress = ({ campaignId, onComplete }) => {
  const [progress, setProgress] = useState({
    status: 'sending',
    sent: 0,
    failed: 0,
    total: 0,
    progress: 0
  })

  useEffect(() => {
    if (!campaignId) return

    console.log(`🔄 Starting real-time progress tracking for campaign: ${campaignId}`)
    
    // ✅ Get token from localStorage and pass as query parameter
    const token = localStorage.getItem('token') // Match your token storage key
    const eventSource = new EventSource(`/api/emails/campaign/${campaignId}/stream?token=${token}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(`📊 Progress update:`, data)
      setProgress(data)
      
      if (data.status === 'completed' && onComplete) {
        onComplete(data)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ EventSource error:', error)
      eventSource.close()
    }

    eventSource.onopen = () => {
      console.log('✅ EventSource connection opened')
    }

    return () => {
      console.log('🔌 Closing EventSource connection')
      eventSource.close()
    }
  }, [campaignId, onComplete])

  // Rest of your component JSX remains the same...
  if (!progress.total) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
        <span className="text-gray-600">Initializing campaign...</span>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          {getStatusIcon()}
          <span className="ml-2">Email Campaign Progress</span>
        </h4>
        <div className="text-sm font-medium text-blue-600">
          {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: {progress.sent}/{progress.total} emails</span>
          <span className="font-medium">{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${
              progress.status === 'completed' ? 'bg-green-500' :
              progress.status === 'failed' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">{progress.sent}</div>
          <div className="text-xs text-gray-500">Delivered</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-600">{progress.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Live Status */}
      {progress.status === 'sending' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-sm text-blue-700">
            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Sending emails in progress... Next email in a few seconds
          </div>
        </div>
      )}

      {progress.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700 font-medium">
            ✅ Campaign completed successfully!
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailSendingProgress
