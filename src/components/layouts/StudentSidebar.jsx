"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function StudentSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: '📊' },
    { name: 'Profile', href: '/student/profile', icon: '👤' },
    { name: 'Companies', href: '/student/companies', icon: '🏢' },
    { name: 'Applications', href: '/student/applications', icon: '📝' },
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">PMS</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Student Portal</p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 sm:mr-3 text-base sm:text-lg">{item.icon}</span>
                <span className="text-sm sm:text-base">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center min-w-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs sm:text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
