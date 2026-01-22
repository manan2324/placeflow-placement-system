"use client"
import { useState } from 'react'
import AdminSidebar from '@/components/layouts/AdminSidebar'

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold text-gray-900">PMS</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
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
