import React from 'react'
import { useQuery } from 'react-query'
import { BarChart3, Users, Send, TrendingUp } from 'lucide-react'
import { authAPI } from '../services/auth'
import { emailsAPI } from '../services/emails'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Dashboard = () => {
  const { data: userStats, isLoading: statsLoading } = useQuery(
    'userStats',
    authAPI.getUserStats
  )

  const { data: emailAnalytics, isLoading: analyticsLoading } = useQuery(
    'emailAnalytics',
    emailsAPI.getEmailAnalytics
  )

  if (statsLoading || analyticsLoading) {
    return <LoadingSpinner />
  }

  const stats = userStats?.data?.data
  const analytics = emailAnalytics?.data?.data

  const statCards = [
    {
      title: 'Contact Groups',
      value: analytics?.totalCampaigns || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Email Campaigns',
      value: analytics?.totalCampaigns || 0,
      icon: Send,
      color: 'bg-green-500'
    },
    {
      title: 'Emails Sent',
      value: analytics?.totalEmailsSent || 0,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Success Rate',
      value: analytics?.totalEmailsSent ? 
        `${Math.round((analytics.totalEmailsSent / (analytics.totalEmailsSent + (analytics.totalEmailsFailed || 0))) * 100)}%` : 
        '0%',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your campaigns.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Usage This Month</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emails Sent</span>
              <span className="font-medium">{stats?.emailsSentThisMonth || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="font-medium">{stats?.remainingEmails || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ 
                  width: `${stats?.emailLimit === -1 ? 0 : Math.min((stats?.emailsSentThisMonth / stats?.emailLimit) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {stats?.emailLimit === -1 ? 'Unlimited plan' : `${stats?.emailsSentThisMonth}/${stats?.emailLimit} emails used`}
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics?.recentEmails?.length ? (
              analytics.recentEmails.map((email) => (
                <div key={email._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                    <p className="text-xs text-gray-500">
                      To: {email.group?.name} • {new Date(email.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    email.status === 'completed' ? 'bg-green-100 text-green-800' :
                    email.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {email.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
