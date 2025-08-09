import React from 'react'
import { useQuery } from 'react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Mail, Users, CheckCircle, XCircle } from 'lucide-react'
import { emailsAPI } from '../../services/emails'

const EmailAnalytics = () => {
  const { data: analyticsData, isLoading } = useQuery(
    'emailAnalytics',
    emailsAPI.getEmailAnalytics
  )

  const analytics = analyticsData?.data?.data

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const successRate = analytics?.totalEmailsSent 
    ? Math.round((analytics.totalEmailsSent / (analytics.totalEmailsSent + (analytics.totalEmailsFailed || 0))) * 100)
    : 0

  const pieData = [
    { name: 'Successful', value: analytics?.totalEmailsSent || 0, color: '#10B981' },
    { name: 'Failed', value: analytics?.totalEmailsFailed || 0, color: '#EF4444' }
  ]

  const recentCampaigns = analytics?.recentEmails?.map(email => ({
    name: email.subject.substring(0, 20) + '...',
    sent: email.successCount,
    failed: email.failedCount,
    date: new Date(email.createdAt).toLocaleDateString()
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Analytics</h2>
        <p className="text-gray-600">Track your email campaign performance and metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalCampaigns || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalEmailsSent || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Emails</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalEmailsFailed || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Delivery Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Successful ({analytics?.totalEmailsSent || 0})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Failed ({analytics?.totalEmailsFailed || 0})</span>
            </div>
          </div>
        </div>

        {/* Recent Campaigns Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaign Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentCampaigns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#10B981" name="Sent" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaign Activity</h3>
        {analytics?.recentEmails?.length ? (
          <div className="space-y-3">
            {analytics.recentEmails.map((email) => (
              <div key={email._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                  <p className="text-xs text-gray-500">
                    To: {email.group?.name} • {new Date(email.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{email.successCount} sent</p>
                  {email.failedCount > 0 && (
                    <p className="text-xs text-red-600">{email.failedCount} failed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  )
}

export default EmailAnalytics
