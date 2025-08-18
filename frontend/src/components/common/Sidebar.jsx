import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Users,
  FileText,
  Mail,
  BarChart3,
  CreditCard,
  X,
  Home,
  User
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Groups', href: '/app/groups', icon: Users },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Campaigns', href: '/app/campaigns', icon: Mail },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/app/profile', icon: User },
  { name: 'Subscription', href: '/app/subscription', icon: CreditCard },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(30,41,59,.5)] backdrop-blur z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary-50 via-white to-slate-50 shadow-xl border-r border-slate-100
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
          <div className="bg-primary-600 rounded-lg flex items-center justify-center w-9 h-9 shadow">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            MailPilot
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 rounded-md text-gray-500 hover:text-primary-600 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Menu */}
        <nav className="mt-2" aria-labelledby="sidebar-title">
          <div className="px-3 py-2 grid gap-1">
            {navigation.map(item => {
              const Icon = item.icon
              const isSelected = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm select-none
                    transition-all duration-150 outline-none border-none
                    ${isActive || isSelected
                      ? "bg-primary-600 text-white shadow border-l-4 border-primary-800"
                      : "text-slate-700 hover:text-primary-700 hover:bg-primary-50"
                    }
                    `
                  }
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isSelected ? "page" : undefined}
                >
                  <Icon
                    className={`
                      w-5 h-5
                      ${isSelected ? "text-white" : "text-primary-600 group-hover:text-primary-700"}
                      transition-colors
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </div>
        </nav>
        {/* SaaS tagline or footer */}
        <div className="mt-auto text-xs text-gray-400 px-6 pt-8 pb-4 hidden lg:block">
          <span>
            © {new Date().getFullYear()} MailPilot · All rights reserved.
          </span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
