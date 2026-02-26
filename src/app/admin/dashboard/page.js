"use client"
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import AdminLayout from '@/components/layouts/AdminLayout'
import StatsGrid from '@/components/admin/dashboard/StatsGrid'
import { AdminDashboardSkeleton } from '@/components/ui/Skeleton'
import { exportApplications, exportFilteredApplications, getAdminDashboard, getApplications, getCompanies } from '@/services/admin.service'

// Lazy-load heavier chart / table panels to reduce initial JS parse time
const BranchWiseStats = dynamic(() => import('@/components/admin/dashboard/BranchWiseStats'), { ssr: false })
const StatusOverview = dynamic(() => import('@/components/admin/dashboard/StatusOverview'), { ssr: false })

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboard()
      setStats(res.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = useCallback(async (companyId) => {
    if (!companyId) return
    try {
      const res = await exportApplications(companyId)
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `applications_${companyId}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }, [])

  const handleFilteredExport = useCallback(async (filters) => {
    try {
      const res = await exportFilteredApplications(filters)
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      let filenameParts = []
      if (filters.branch && filters.branch.length > 0) filenameParts.push(filters.branch.join('-'))
      if (filters.status) filenameParts.push(filters.status)
      if (filters.yearOfSelection) filenameParts.push(`year${filters.yearOfSelection}`)
      if (filters.companyId) filenameParts.push('company')

      link.download = filenameParts.length > 0
        ? `${filenameParts.join('_')}_applications.csv`
        : 'filtered_applications.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export filtered CSV:', error)
    }
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <AdminDashboardSkeleton />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Overview of placement statistics</p>
        </div>

        <StatsGrid stats={stats} />

        <BranchWiseStats branchWiseStats={stats?.branchWiseStats} />

        <StatusOverview statusCounts={stats?.statusCounts} />
      </div>
    </AdminLayout>
  )
}
