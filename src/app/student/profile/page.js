"use client"
import { useState, useEffect } from 'react'
import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getStudentProfile, updateStudentProfile, uploadResume } from '@/services/student.api'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await getStudentProfile();
      setProfile(res.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      await uploadResume(formData)
      alert('Resume uploaded successfully!')
      fetchProfile()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl">
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Personal Information">
            <div className="space-y-3 sm:space-y-4">
              <Input label="Name" value={profile?.userId?.name || ''} disabled />
              <Input label="Email" value={profile?.userId?.email || ''} disabled />
              <Input label="Enrollment Number" value={profile?.enrollmentNumber || ''} disabled />
              <Input label="Branch" value={profile?.branch || ''} disabled />
              <Input label="CGPA" value={profile?.cgpa || 'N/A'} disabled />
              <Input label="Number of Backlogs" value={profile?.backlogCount ?? 0} disabled />
            </div>
          </Card>

          <Card title="Resume">
            <div className="space-y-4">
              {/* Current Resume Status */}
              {profile?.resumeUrl ? (
                <div className="relative overflow-hidden">
                  <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border-2 border-green-200 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Resume Uploaded</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Last updated: {profile.resumeUpdatedAt 
                              ? new Date(profile.resumeUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Unknown'}
                          </p>
                          <a
                            href={profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 text-xs sm:text-sm font-medium rounded-lg border border-green-300 hover:bg-green-50 transition-all hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Resume
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-5 border-2 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">No Resume Uploaded</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Upload your resume to apply for companies</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload New Resume */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 hover:border-indigo-400 transition-colors bg-gray-50">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                    {profile?.resumeUrl ? 'Upload New Resume' : 'Upload Your Resume'}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    PDF files only • Maximum size: 2MB
                  </p>
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                      uploading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:scale-105'
                    }`}>
                      {uploading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Choose File
                        </>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}
