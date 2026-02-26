"use client"
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '@/components/layouts/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { TablePageSkeleton } from '@/components/ui/Skeleton'
import { Inbox } from 'lucide-react'
import api from '@/lib/axios'
import { formatDateTime } from '@/utils/date'

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' 
        ? '/admin/student-requests' 
        : `/admin/student-requests?status=${filter}`
      const response = await api.get(url)
      setRequests(response.data.data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      toast.error('Failed to load student requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this profile update request?')) {
      return
    }

    setProcessingId(requestId)
    try {
      await api.put(`/admin/student-requests/${requestId}`, { action: 'approve' })
      toast.success('Profile update request approved successfully')
      fetchRequests()
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast.error(error.response?.data?.message || 'Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectClick = (request) => {
    setSelectedRequest(request)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.warn('Please provide a reason for rejection')
      return
    }

    setProcessingId(selectedRequest._id)
    try {
      await api.put(`/admin/student-requests/${selectedRequest._id}`, {
        action: 'reject',
        rejectionReason: rejectionReason.trim()
      })
      toast.success('Profile update request rejected successfully')
      setShowRejectModal(false)
      setSelectedRequest(null)
      setRejectionReason('')
      fetchRequests()
    } catch (error) {
      console.error('Failed to reject request:', error)
      toast.error(error.response?.data?.message || 'Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const renderChanges = (currentValues, requestedChanges) => {
    const changes = []
    const fields = {
      enrollmentNumber: 'Enrollment Number',
      branch: 'Branch',
      cgpa: 'CGPA',
      backlogCount: 'Backlogs',
      mobileNumber: 'Mobile Number'
    }

    Object.keys(requestedChanges).forEach(key => {
      if (currentValues[key] !== requestedChanges[key]) {
        changes.push({
          field: fields[key] || key,
          from: currentValues[key] ?? 'N/A',
          to: requestedChanges[key]
        })
      }
    })

    return changes
  }

  if (loading) {
    return (
      <AdminLayout>
        <TablePageSkeleton rows={6} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Student Profile Update Requests</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Review and manage student profile change requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm capitalize transition-colors whitespace-nowrap ${
                filter === status
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'pending' 
                  ? 'No pending requests at the moment' 
                  : `No ${filter} requests found`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const changes = renderChanges(request.currentValues, request.requestedChanges)
              return (
                <Card key={request._id}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {request.studentId?.name || 'Unknown Student'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{request.studentId?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested on {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Changes Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Field
                            </th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Current
                            </th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Requested
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {changes.map((change, idx) => (
                            <tr key={idx}>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                                {change.field}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-600">
                                {change.from}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-indigo-600">
                                {change.to}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Review Info (for approved/rejected) */}
                    {request.status !== 'pending' && (
                      <div className={`p-4 rounded-lg ${
                        request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <p className="text-sm font-medium text-gray-900">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                          {request.reviewedBy?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Reviewed on {formatDateTime(request.reviewedAt)}
                        </p>
                        {request.rejectionReason && (
                          <p className="text-sm text-red-700 mt-2">
                            <span className="font-medium">Reason:</span> {request.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons (for pending requests) */}
                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processingId === request._id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleRejectClick(request)}
                          disabled={processingId === request._id}
                          variant="secondary"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Profile Update Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || processingId === selectedRequest?._id}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {processingId === selectedRequest?._id ? 'Processing...' : 'Confirm Reject'}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedRequest(null)
                  setRejectionReason('')
                }}
                variant="secondary"
                disabled={processingId === selectedRequest?._id}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
