import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Send, 
  BarChart3, 
  Settings, 
  CreditCard,
  X,
  Home,
  Mail,
  User
} from 'lucide-react'

// In your navigation items, update the paths:
const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home, current: location.pathname === '/app/dashboard' },
  { name: 'Groups', href: '/app/groups', icon: Users, current: location.pathname === '/app/groups' },
  { name: 'Templates', href: '/app/templates', icon: FileText, current: location.pathname === '/app/templates' },
  { name: 'Campaigns', href: '/app/campaigns', icon: Mail, current: location.pathname === '/app/campaigns' },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3, current: location.pathname === '/app/analytics' },
  { name: 'Profile', href: '/app/profile', icon: User, current: location.pathname === '/app/profile' },
  { name: 'Subscription', href: '/app/subscription', icon: CreditCard, current: location.pathname === '/app/subscription' },
]


const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 mt-16 lg:mt-0">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
