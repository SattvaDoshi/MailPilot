import React, { useState } from 'react'
import EmailComposer from '../components/email/EmailComposer'
import EmailHistory from '../components/email/EmailHistory'

const EmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState('compose')

  const tabs = [
    { id: 'compose', name: 'Compose', component: EmailComposer },
    { id: 'history', name: 'Campaign History', component: EmailHistory }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  )
}

export default EmailCampaigns
