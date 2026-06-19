"use client"
import { useState, memo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import StudentSidebar from '@/components/layouts/StudentSidebar'

// NotificationDropdown polls the API every 30 s – load it after initial render
const NotificationDropdown = dynamic(
  () => import('@/components/student/NotificationDropdown'),
  { ssr: false }
)

function StudentLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <StudentSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between sticky top-0 z-30">
          <Link href="/student/dashboard" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PlaceFlow</span>
          </Link>
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <Link href="/student/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PF</span>
            </div>
            <span className="text-lg font-bold text-gray-900">PlaceFlow</span>
          </Link>
          <NotificationDropdown />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default memo(StudentLayout);
