import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Eye, Clock, CheckCircle, XCircle, Users, Calendar } from 'lucide-react'
import { emailsAPI } from '../../services/emails'
import Modal from '../common/Modal'
import EmailStatus from './EmailStatus'

const EmailHistory = () => {
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [page, setPage] = useState(1)
  const [statusModalOpen, setStatusModalOpen] = useState(false)

  const { data: historyData, isLoading } = useQuery(
    ['emailHistory', page],
    () => emailsAPI.getEmailHistory({ page, limit: 10 })
  )

  const history = historyData?.data?.data

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'sending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewStatus = (email) => {
    setSelectedEmail(email)
    setStatusModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Campaign History</h2>
        <p className="text-gray-600">Track the status and performance of your email campaigns</p>
      </div>

      {!history?.emails?.length ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
          <p className="mt-1 text-sm text-gray-500">Your email campaigns will appear here once you send them.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.emails.map((email) => {
                    const successRate = email.totalRecipients > 0 
                      ? Math.round((email.successCount / email.totalRecipients) * 100) 
                      : 0

                    return (
                      <tr key={email._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                            <div className="text-sm text-gray-500">{email.group?.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="w-4 h-4 mr-1" />
                            {email.totalRecipients}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(email.status)}
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                              {email.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {successRate}% ({email.successCount}/{email.totalRecipients})
                          </div>
                          {email.failedCount > 0 && (
                            <div className="text-xs text-red-600">{email.failedCount} failed</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(email.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewStatus(email)}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {history.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {history.currentPage} of {history.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= history.totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Campaign Details"
        size="lg"
      >
        {selectedEmail && (
          <EmailStatus email={selectedEmail} onClose={() => setStatusModalOpen(false)} />
        )}
      </Modal>
    </div>
  )
}

export default EmailHistory
