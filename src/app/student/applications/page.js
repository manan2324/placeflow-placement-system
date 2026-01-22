"use client"
import { useState, useEffect } from 'react'
import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { getStudentApplications } from '@/services/student.api'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await getStudentApplications()
      setApplications(res.data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      SHORTLISTED: 'info',
      SELECTED: 'success',
      REJECTED: 'danger',
    }
    return colors[status] || 'default'
  }

  const columns = [
    { key: 'companyName', label: 'Company' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge> },
    { key: 'appliedAt', label: 'Applied Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (row) => (
      <a href={`/student/applications/${row._id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base">
        View Details
      </a>
    )}
  ]

  return (
    <StudentLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track all your job applications</p>
        </div>

        <Card>
          {/* Mobile view - Card list */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications yet</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app._id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{app.companyName}</h3>
                    <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <a 
                    href={`/student/applications/${app._id}`} 
                    className="inline-block text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    View Details →
                  </a>
                </div>
              ))
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table columns={columns} data={applications} loading={loading} />
          </div>
        </Card>
      </div>
    </StudentLayout>
  )
}
