"use client"
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { LayoutDashboard, GraduationCap, Building2, FileText, FilePenLine, ClipboardList, X, LogOut, Download } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import axios from '@/lib/axios'

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setAuth, logout } = useAuthStore()
  const isLoggingOut = useRef(false)

  useEffect(() => {
    // Fetch user data if not available or incomplete and not logging out
    if ((!user || !user.name) && !isLoggingOut.current) {
      fetchUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/auth/me')
      if (response.data && response.data.user) {
        setAuth({ 
          user: response.data.user, 
          role: response.data.user.role 
        })
      }
    } catch (error) {
      // Only handle errors if we're not already logging out
      if (!isLoggingOut.current) {
        console.error('Failed to fetch user data:', error)
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          logout()
          router.push('/auth/login')
        }
      }
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: GraduationCap },
    { name: 'Companies', href: '/admin/companies', icon: Building2 },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Student Requests', href: '/admin/student-requests', icon: FilePenLine },
    { name: 'Logs', href: '/admin/application-logs', icon: ClipboardList },
    { name: 'Data Export', href: '/admin/data-export', icon: Download },
  ]

  const handleLogout = async () => {
    isLoggingOut.current = true
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout request failed')
    } finally {
      logout()
      toast.success('Logged out successfully')
      router.push('/auth/login')
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
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">PlaceFlow</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Admin Portal</p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center min-w-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm sm:text-base">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:scale-[1.02]"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
