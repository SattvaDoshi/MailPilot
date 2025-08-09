import React from 'react'
import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">
            Bulk Email Sender
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-md">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 rounded-md"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
