"use client"
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '@/components/layouts/AdminLayout'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getApplications, updateApplicationStatus } from '@/services/admin.service'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [branchFilter, setBranchFilter] = useState('ALL')
  
  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CHE']

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await getApplications()
      setApplications(res.data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id)
    try {
      await updateApplicationStatus(id, newStatus)
      toast.success('Status updated successfully!')
      fetchApplications()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      APPLIED: 'warning',
      SHORTLISTED: 'info',
      SELECTED: 'success',
      REJECTED: 'danger',
    }
    return colors[status] || 'default'
  }

  // Filter applications by branch
  const filteredApplications = branchFilter === 'ALL' 
    ? applications 
    : applications.filter(app => app.studentId?.branch === branchFilter)

  const renderActionButtons = (row) => {
    const isUpdating = updating === row._id

    if (row.status === 'APPLIED') {
      return (
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <Button
            variant="primary"
            className="text-xs py-1 px-2"
            onClick={() => handleStatusUpdate(row._id, 'SHORTLISTED')}
            disabled={isUpdating}
          >
            Shortlist
          </Button>
          <Button
            variant="danger"
            className="text-xs py-1 px-2"
            onClick={() => handleStatusUpdate(row._id, 'REJECTED')}
            disabled={isUpdating}
          >
            Reject
          </Button>
        </div>
      )
    }

    if (row.status === 'SHORTLISTED') {
      return (
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <Button
            variant="success"
            className="text-xs py-1 px-2"
            onClick={() => handleStatusUpdate(row._id, 'SELECTED')}
            disabled={isUpdating}
          >
            Select
          </Button>
          <Button
            variant="danger"
            className="text-xs py-1 px-2"
            onClick={() => handleStatusUpdate(row._id, 'REJECTED')}
            disabled={isUpdating}
          >
            Reject
          </Button>
        </div>
      )
    }

    return <span className="text-xs text-gray-500">No actions</span>
  }

  const columns = [
    { key: 'studentName', label: 'Student', render: (row) => row.studentId?.userId?.name || 'N/A' },
    { key: 'mobileNumber', label: 'Mobile Number', render: (row) => row.studentId?.mobileNumber || 'N/A' },
    { key: 'companyName', label: 'Company', render: (row) => row.companyId?.name || 'N/A' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge> },
    { key: 'appliedAt', label: 'Applied Date', render: (row) => new Date(row.appliedAt).toLocaleDateString() },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: renderActionButtons
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up">
          <div className="flex justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Applications</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage student applications</p>
            </div>
          </div>
          
          {/* Branch Filter */}
          <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <label htmlFor="branchFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Branch:
            </label>
            <select
              id="branchFilter"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="flex-1 sm:flex-initial sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm bg-white"
            >
              <option value="ALL">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            {branchFilter !== 'ALL' && (
              <button
                onClick={() => setBranchFilter('ALL')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
              >
                Clear Filter
              </button>
            )}
            <div className="ml-auto text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <Card>
          {/* Mobile view - Card list */}
          <div className="block lg:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {branchFilter === 'ALL' ? 'No applications found' : `No applications found for ${branchFilter} branch`}
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div key={app._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{app.studentId?.userId?.name || 'N/A'}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{app.studentId?.mobileNumber || 'N/A'}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{app.companyId?.name || 'N/A'}</p>
                    </div>
                    <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 pt-1">
                    {app.status === 'APPLIED' && (
                      <>
                        <Button
                          variant="primary"
                          className="text-xs py-1.5 px-3 flex-1"
                          onClick={() => handleStatusUpdate(app._id, 'SHORTLISTED')}
                          disabled={updating === app._id}
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="danger"
                          className="text-xs py-1.5 px-3 flex-1"
                          onClick={() => handleStatusUpdate(app._id, 'REJECTED')}
                          disabled={updating === app._id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'SHORTLISTED' && (
                      <>
                        <Button
                          variant="success"
                          className="text-xs py-1.5 px-3 flex-1"
                          onClick={() => handleStatusUpdate(app._id, 'SELECTED')}
                          disabled={updating === app._id}
                        >
                          Select
                        </Button>
                        <Button
                          variant="danger"
                          className="text-xs py-1.5 px-3 flex-1"
                          onClick={() => handleStatusUpdate(app._id, 'REJECTED')}
                          disabled={updating === app._id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {(app.status === 'SELECTED' || app.status === 'REJECTED') && (
                      <span className="text-xs text-gray-500 py-1.5">No actions available</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table columns={columns} data={filteredApplications} loading={loading} />
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
