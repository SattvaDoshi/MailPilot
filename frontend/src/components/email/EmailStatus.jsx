import React from 'react'
import { CheckCircle, XCircle, Clock, Users, Mail } from 'lucide-react'

const EmailStatus = ({ email, onClose }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">{email.subject}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <span>Total: {email.totalRecipients}</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>Sent: {email.successCount}</span>
          </div>
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-2" />
            <span>Failed: {email.failedCount}</span>
          </div>
        </div>
      </div>

      {/* Recipient Details */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recipient Status</h4>
        <div className="max-h-64 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Recipient
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {email.recipients?.map((recipient, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{recipient.name}</div>
                      <div className="text-gray-500">{recipient.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <div className={`flex items-center ${getStatusColor(recipient.status)}`}>
                      {getStatusIcon(recipient.status)}
                      <span className="ml-2 capitalize">{recipient.status}</span>
                    </div>
                    {recipient.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">{recipient.errorMessage}</div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {recipient.sentAt ? new Date(recipient.sentAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  )
}

export default EmailStatus
