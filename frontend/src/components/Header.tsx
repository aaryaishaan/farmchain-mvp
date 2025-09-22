"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import { LogOut, User, Leaf } from "lucide-react"

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">FarmChain</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{user?.name}</span>
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                {user?.role}
              </span>
            </div>
            <button onClick={logout} className="btn-outline flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
