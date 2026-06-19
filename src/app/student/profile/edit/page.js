"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { TablePageSkeleton } from '@/components/ui/Skeleton'
import { getStudentProfile } from '@/services/student.api'
import { TriangleAlert, Loader2 } from 'lucide-react'
import api from '@/lib/axios'

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    branch: '',
    cgpa: '',
    backlogCount: '',
    mobileNumber: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await getStudentProfile()
      setProfile(res.data)
      setFormData({
        enrollmentNumber: res.data?.enrollmentNumber || '',
        branch: res.data?.branch || '',
        cgpa: res.data?.cgpa || '',
        backlogCount: res.data?.backlogCount ?? 0,
        mobileNumber: res.data?.mobileNumber || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }

  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate changes
    const requestedChanges = {}
    if (formData.enrollmentNumber !== profile.enrollmentNumber) {
      requestedChanges.enrollmentNumber = formData.enrollmentNumber
    }
    if (formData.branch !== profile.branch) {
      requestedChanges.branch = formData.branch
    }
    if (parseFloat(formData.cgpa) !== profile.cgpa) {
      requestedChanges.cgpa = parseFloat(formData.cgpa)
    }
    if (parseInt(formData.backlogCount) !== profile.backlogCount) {
      requestedChanges.backlogCount = parseInt(formData.backlogCount)
    }

    if (Object.keys(requestedChanges).length === 0) {
      toast.info('No changes detected')
      return
    }

    // Validate CGPA range
    if (requestedChanges.cgpa !== undefined && (requestedChanges.cgpa < 0 || requestedChanges.cgpa > 10)) {
      toast.warn('CGPA must be between 0 and 10')
      return
    }

    // Validate backlog count
    if (requestedChanges.backlogCount !== undefined && requestedChanges.backlogCount < 0) {
      toast.warn('Backlog count cannot be negative')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/student/profile/request', { requestedChanges })
      toast.success(response.data.message || 'Your profile update request has been submitted successfully. Please wait for admin approval.')
      router.push('/student/profile')
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error(error.response?.data?.message || 'Failed to submit profile update request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <TablePageSkeleton rows={6} />
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-8 sm:px-6 lg:px-8 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">
            Request changes to your profile information. Changes require admin approval.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name, Email and Mobile (Read-only) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Account Information (Cannot be changed)</p>
              <Input 
                label="Name" 
                value={profile?.userId?.name || ''} 
                disabled 
              />
              <Input 
                label="Email" 
                value={profile?.userId?.email || ''} 
                disabled 
              />
              <Input
                label="Mobile Number"
                value={profile?.mobileNumber || 'Not provided'}
                disabled
              />
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Profile Information</p>
              
              <Input
                label="Enrollment Number"
                name="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                required
                placeholder="Enter enrollment number"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:scale-[1.01] outline-none transition-all duration-200 bg-white"
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="IT">IT (Information Technology)</option>
                  <option value="ECE">ECE (Electronics)</option>
                  <option value="EE">EE (Electrical)</option>
                  <option value="ME">ME (Mechanical)</option>
                  <option value="CE">CE (Civil)</option>
                  <option value="CHE">CHE (Chemical)</option>
                </select>
              </div>

              <Input
                label="CGPA"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleChange}
                required
                placeholder="Enter CGPA (0-10)"
              />

              <Input
                label="Number of Backlogs"
                name="backlogCount"
                type="number"
                min="0"
                value={formData.backlogCount}
                onChange={handleChange}
                required
                placeholder="Enter backlog count"
              />

            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <TriangleAlert className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your changes will be sent to the admin for review. You will be notified once your request is processed.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/student/profile')}
                variant="secondary"
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </StudentLayout>
  )
}
