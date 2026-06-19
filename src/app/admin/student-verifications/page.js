"use client"
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '@/components/layouts/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { TablePageSkeleton } from '@/components/ui/Skeleton'
import { Inbox, UserCheck, UserX, Mail, Phone, GraduationCap, Hash, BookOpen, AlertTriangle } from 'lucide-react'
import api from '@/lib/axios'
import { formatDateTime } from '@/utils/date'

export default function StudentVerificationsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [processingId, setProcessingId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [filter])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await api.get('/admin/student-verifications', { params })
      setStudents(response.data.data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast.error('Failed to load student verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (studentId) => {
    if (!confirm('Are you sure you want to approve this student? They will be able to log in to the system.')) {
      return
    }

    setProcessingId(studentId)
    try {
      await api.patch(`/admin/student-verifications/${studentId}`, { action: 'approve' })
      toast.success('Student approved successfully. An approval email has been sent.')
      fetchStudents()
    } catch (error) {
      console.error('Failed to approve student:', error)
      toast.error(error.response?.data?.message || 'Failed to approve student')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectClick = (student) => {
    setSelectedStudent(student)
    setShowRejectModal(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedStudent) return

    setProcessingId(selectedStudent._id)
    try {
      await api.patch(`/admin/student-verifications/${selectedStudent._id}`, { action: 'reject' })
      toast.success('Student rejected and account removed. A rejection email has been sent.')
      setShowRejectModal(false)
      setSelectedStudent(null)
      fetchStudents()
    } catch (error) {
      console.error('Failed to reject student:', error)
      toast.error(error.response?.data?.message || 'Failed to reject student')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return <Badge variant="success">Approved</Badge>
    }
    return <Badge variant="warning">Pending</Badge>
  }

  const pendingCount = students.filter(s => s.isApproved === false).length

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
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Student Verifications</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">
            Review and approve new student registrations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {[
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'all', label: 'All' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm capitalize transition-colors whitespace-nowrap ${
                filter === key
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
              {key === 'pending' && pendingCount > 0 && filter !== 'pending' && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Students List */}
        {students.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'pending'
                  ? 'No pending verification requests at the moment'
                  : `No ${filter} students found`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <Card key={student._id}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {student.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered on {formatDateTime(student.registeredAt)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(student.isApproved)}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Field
                          </th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                            <span className="flex items-center gap-1.5">
                              <Hash className="w-3.5 h-3.5 text-gray-400" />
                              Enrollment Number
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 font-mono">
                            {student.enrollmentNumber || '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                              Branch
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700">
                            {student.branch || '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                              CGPA
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700">
                            {student.cgpa !== null && student.cgpa !== undefined ? student.cgpa : '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                              Backlogs
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700">
                            {student.backlogCount}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              Mobile Number
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 font-mono">
                            {student.mobileNumber || '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Approved Info */}
                  {student.isApproved === true && student.approvedAt && (
                    <div className="p-4 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-green-800 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        Approved
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Approved on {formatDateTime(student.approvedAt)}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons (for pending students) */}
                  {student.isApproved === false && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleApprove(student._id)}
                        disabled={processingId === student._id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <UserCheck className="w-4 h-4" />
                          {processingId === student._id ? 'Processing...' : 'Approve'}
                        </span>
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(student)}
                        disabled={processingId === student._id}
                        variant="secondary"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <UserX className="w-4 h-4" />
                          Reject
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Student Registration
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to reject <strong>{selectedStudent?.name}</strong>&apos;s registration?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete their account and profile. The student will receive a rejection email and can register again with correct details.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleRejectConfirm}
                disabled={processingId === selectedStudent?._id}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {processingId === selectedStudent?._id ? 'Processing...' : 'Confirm Reject'}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedStudent(null)
                }}
                variant="secondary"
                disabled={processingId === selectedStudent?._id}
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
