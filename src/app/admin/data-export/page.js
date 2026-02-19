"use client"
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layouts/AdminLayout'
import StudentFiltersPanel from '@/components/admin/dashboard/StudentFiltersPanel'
import { exportApplications, exportFilteredApplications, getApplications, getCompanies } from '@/services/admin.service'

export default function DataExport() {
  const [companies, setCompanies] = useState([])
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(true)
  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CHE']

  useEffect(() => {
    fetchCompanies()
    fetchApplications()
  }, [])

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
      if (filters.yearOfSelection) {
        filenameParts.push(`year${filters.yearOfSelection}`)
      }
      if (filters.companyId) {
        filenameParts.push('company')
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

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Export</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Export application data with filters</p>
        </div>

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
