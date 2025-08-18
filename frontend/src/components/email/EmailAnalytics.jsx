import React from 'react'
import { useQuery } from 'react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Mail, Users, CheckCircle, XCircle, Calendar, Target, Activity } from 'lucide-react'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const successRate = analytics?.totalEmailsSent 
    ? Math.round((analytics.totalEmailsSent / (analytics.totalEmailsSent + (analytics.totalEmailsFailed || 0))) * 100)
    : 0

  const pieData = [
    { name: 'Delivered', value: analytics?.totalEmailsSent || 0, color: '#059669' },
    { name: 'Failed', value: analytics?.totalEmailsFailed || 0, color: '#DC2626' }
  ]

  const recentCampaigns = analytics?.recentEmails?.map(email => ({
    name: email.subject.substring(0, 15) + '...',
    sent: email.successCount,
    failed: email.failedCount,
    date: new Date(email.createdAt).toLocaleDateString(),
    successRate: email.totalRecipients > 0 ? Math.round((email.successCount / email.totalRecipients) * 100) : 0
  })) || []

  // SEO structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dashboard",
    "name": "Email Analytics Dashboard - MailPilot",
    "description": "Comprehensive email campaign analytics and performance metrics",
    "applicationCategory": "Email Marketing Analytics"
  }

  return (
    <>
      {/* SEO Meta Content */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <div className="space-y-8 max-w-7xl mx-auto" role="main" aria-label="Email Analytics Dashboard">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Analytics</h1>
              <p className="text-gray-600 text-lg">
                Track your campaign performance and optimize your email marketing strategy
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.totalCampaigns || 0}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Emails Delivered</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.totalEmailsSent || 0}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Success rate: {successRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Failed Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.totalEmailsFailed || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Bounce & errors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Deliverability Rate</p>
                <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {successRate >= 95 ? 'Excellent' : successRate >= 85 ? 'Good' : 'Needs improvement'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Delivery Status Pie Chart */}
          <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Delivery Overview</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value.toLocaleString(), name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 font-medium">
                  Delivered ({(analytics?.totalEmailsSent || 0).toLocaleString()})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 font-medium">
                  Failed ({(analytics?.totalEmailsFailed || 0).toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Performance Bar Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Campaign Performance</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                  <span className="text-gray-600">Delivered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className="text-gray-600">Failed</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentCampaigns} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="sent" fill="#059669" name="Delivered" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="failed" fill="#DC2626" name="Failed" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-600" />
              Recent Campaign Activity
            </h3>
            <p className="text-sm text-gray-600 mt-1">Track your latest email campaign performance</p>
          </div>
          
          {analytics?.recentEmails?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.recentEmails.map((email) => {
                    const rate = email.totalRecipients > 0 ? Math.round((email.successCount / email.totalRecipients) * 100) : 0
                    return (
                      <tr key={email._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                            <p className="text-xs text-gray-500">{email.totalRecipients} recipients</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {email.group?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{email.successCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {email.failedCount > 0 ? (
                            <div className="flex items-center">
                              <XCircle className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-sm font-medium text-red-600">{email.failedCount}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{rate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(email.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No campaign activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Start sending campaigns to see analytics</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default EmailAnalytics
