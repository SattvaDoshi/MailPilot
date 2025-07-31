// src/pages/Dashboard.jsx
import React from 'react';
import { useQuery } from 'react-query';
import { subscriptionAPI, groupsAPI, emailsAPI } from '../services/api';
import { Users, FileText, Send, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, change, color = "blue" }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
      {change && (
        <div className="mt-2">
          <div className={`flex items-baseline text-sm ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change > 0 ? '+' : ''}{change}% from last month
          </div>
        </div>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { data: subscription, isLoading: subLoading } = useQuery(
    'subscription',
    subscriptionAPI.getStatus
  );

  const { data: groups, isLoading: groupsLoading } = useQuery(
    'groups',
    groupsAPI.getAll
  );

  const { data: emailHistory, isLoading: emailLoading } = useQuery(
    'emailHistory',
    () => emailsAPI.getHistory({ limit: 5 })
  );

  if (subLoading || groupsLoading || emailLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      title: 'Contact Groups',
      value: groups?.data?.groups?.length || 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Templates',
      value: 12, // You'd get this from templates API
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Emails Sent',
      value: subscription?.data?.subscription?.emailsUsed || 0,
      icon: Send,
      color: 'purple'
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      icon: TrendingUp,
      color: 'yellow'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your email campaigns.
        </p>
      </div>

      {/* Subscription Status */}
      <div className="mb-8 bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-500">
              {subscription?.data?.subscription?.plan || 'Free'} Plan
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Email Usage</p>
            <p className="text-lg font-semibold">
              {subscription?.data?.subscription?.emailsUsed || 0} / {' '}
              {subscription?.data?.subscription?.emailLimit === -1 
                ? 'Unlimited' 
                : subscription?.data?.subscription?.emailLimit || 20
              }
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full"
              style={{
                width: `${Math.min(
                  (subscription?.data?.subscription?.emailsUsed || 0) / 
                  (subscription?.data?.subscription?.emailLimit || 20) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Email Activity
          </h3>
          
          {emailHistory?.data?.logs?.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {emailHistory.data.logs.slice(0, 5).map((log, index) => (
                  <li key={log._id}>
                    <div className="relative pb-8">
                      {index !== emailHistory.data.logs.slice(0, 5).length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            log.status === 'sent' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            <Send className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Email {log.status} to{' '}
                              <span className="font-medium text-gray-900">
                                {log.recipientEmail}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No email activity yet. Start your first campaign!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
