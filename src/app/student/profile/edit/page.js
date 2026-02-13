"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getStudentProfile } from '@/services/student.api'
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
    if (formData.mobileNumber !== profile.mobileNumber) {
      requestedChanges.mobileNumber = formData.mobileNumber
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

    // Validate mobile number
    if (requestedChanges.mobileNumber !== undefined && requestedChanges.mobileNumber && !/^[0-9]{10}$/.test(requestedChanges.mobileNumber)) {
      toast.warn('Mobile number must be 10 digits')
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
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-3xl">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Request changes to your profile information. Changes require admin approval.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email (Read-only) */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

              <Input
                label="Mobile Number (Optional)"
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength="10"
              />
              <p className="text-xs text-gray-500 -mt-2">Enter 10-digit mobile number</p>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
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
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
