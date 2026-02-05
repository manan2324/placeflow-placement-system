"use client"
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layouts/AdminLayout'
import StatsGrid from '@/components/admin/dashboard/StatsGrid'
import BranchWiseStats from '@/components/admin/dashboard/BranchWiseStats'
import StatusOverview from '@/components/admin/dashboard/StatusOverview'
import CompanyApplicantsTable from '@/components/admin/dashboard/CompanyApplicantsTable'
import StudentFiltersPanel from '@/components/admin/dashboard/StudentFiltersPanel'
import { exportApplications, exportFilteredApplications, getAdminDashboard, getApplications, getCompanies } from '@/services/admin.service'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState([])
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(true)
  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CHE']

  useEffect(() => {
    fetchDashboard()
    fetchCompanies()
    fetchApplications()
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

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies()
      setCompanies(res.data)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }

  const fetchApplications = async () => {
    setAppsLoading(true)
    try {
      const res = await getApplications()
      setApplications(res.data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setAppsLoading(false)
    }
  }

  const handleExport = async (companyId) => {
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
  }

  const handleFilteredExport = async (filters) => {
    try {
      const res = await exportFilteredApplications(filters)
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename based on filters
      let filenameParts = []
      if (filters.branch && filters.branch.length > 0) {
        filenameParts.push(filters.branch.join('-'))
      }
      if (filters.status) {
        filenameParts.push(filters.status)
      }
      if (filters.companyId && filters.companyId.length > 0) {
        filenameParts.push(filters.companyId.length === 1 ? 'company' : `${filters.companyId.length}companies`)
      }
      const filename = filenameParts.length > 0 
        ? `${filenameParts.join('_')}_applications.csv`
        : 'filtered_applications.csv'
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export filtered CSV:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of placement statistics</p>
        </div>

        <StatsGrid stats={stats} />

        <BranchWiseStats branchWiseStats={stats?.branchWiseStats} />

        <StatusOverview statusCounts={stats?.statusCounts} />

        <CompanyApplicantsTable companyStats={stats?.companyStats} onExport={handleExport} />

        <StudentFiltersPanel
          applications={applications}
          companies={companies}
          branches={branches}
          loading={appsLoading}
          onExport={handleExport}
          onFilteredExport={handleFilteredExport}
        />
      </div>
    </AdminLayout>
  )
}
