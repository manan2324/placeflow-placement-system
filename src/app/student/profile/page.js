"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ResumeViewer from '@/components/student/ResumeViewer'
import { getStudentProfile, uploadResume } from '@/services/student.api'
import { PencilLine, BookOpen, IdCard, Building2, BarChart3, TriangleAlert, User, Mail, Phone, FileText, CheckCircle2, Upload, Info, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
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
      const response = await uploadResume(formData)
      toast.success(response.data?.message || 'Resume uploaded successfully!')
      fetchProfile()
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload resume'
      toast.error(errorMsg)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Upload error:', error.response?.data || error)
      }
    } finally {
      setUploading(false)
    }
  }

  const InfoItem = ({ icon, label, value, badge = null }) => (
    <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 mb-0.5">{label}</p>
        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate flex items-center gap-2">
          {value || 'N/A'}
          {badge && badge}
        </p>
      </div>
    </div>
  )

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
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold">
                {profile?.userId?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{profile?.userId?.name || 'Student'}</h1>
                <p className="text-indigo-100 text-sm sm:text-base mt-1">{profile?.userId?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="success" className="bg-white/20 text-white border-white/30">
                    Active
                  </Badge>
                  {profile?.resumeUrl && (
                    <Badge variant="success" className="bg-green-500/90 text-white">
                      Resume Uploaded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push('/student/profile/edit')}
              className="hover:bg-indigo-50 shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <PencilLine className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Information - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Academic Information</h2>
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={
                    <IdCard className="w-5 h-5 text-indigo-600" />
                  }
                  label="Enrollment Number"
                  value={profile?.enrollmentNumber}
                />
                
                <InfoItem
                  icon={
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  }
                  label="Branch"
                  value={profile?.branch}
                />
                
                <InfoItem
                  icon={
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  }
                  label="CGPA"
                  value={profile?.cgpa?.toFixed(2)}
                  badge={
                    profile?.cgpa >= 8 ? (
                      <Badge variant="success" className="text-xs">Excellent</Badge>
                    ) : profile?.cgpa >= 6.5 ? (
                      <Badge variant="warning" className="text-xs">Good</Badge>
                    ) : null
                  }
                />
                
                <InfoItem
                  icon={
                    <TriangleAlert className="w-5 h-5 text-indigo-600" />
                  }
                  label="Active Backlogs"
                  value={profile?.backlogCount ?? 0}
                  badge={
                    profile?.backlogCount === 0 ? (
                      <Badge variant="success" className="text-xs">Clear</Badge>
                    ) : (
                      <Badge variant="danger" className="text-xs">Action Needed</Badge>
                    )
                  }
                />
              </div>
            </Card>

            {/* Account Information */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Account Details</h2>
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={
                    <User className="w-5 h-5 text-indigo-600" />
                  }
                  label="Full Name"
                  value={profile?.userId?.name}
                />
                
                <InfoItem
                  icon={
                    <Mail className="w-5 h-5 text-indigo-600" />
                  }
                  label="Email Address"
                  value={profile?.userId?.email}
                />
                
                <InfoItem
                  icon={
                    <Phone className="w-5 h-5 text-indigo-600" />
                  }
                  label="Mobile Number"
                  value={profile?.mobileNumber || 'Not provided'}
                />
              </div>
            </Card>
          </div>

          {/* Resume Section - Takes 1 column on large screens */}
          <div className="lg:col-span-1">

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Resume</h2>
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>

              {/* Resume Status */}
              {profile?.resumeUrl ? (
                <div className="space-y-4">
                  <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Resume Active</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Updated {profile.resumeUpdatedAt 
                            ? new Date(profile.resumeUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'recently'}
                        </p>
                      </div>
                    </div>
                    <ResumeViewer 
                      resumeId={profile.resumeUrl} 
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-green-700 border border-green-300 hover:bg-green-50 transition-all hover:shadow-md"
                    />
                  </div>

                  {/* Upload New Resume */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-400 transition-colors bg-gray-50">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Update Resume</h4>
                      <p className="text-xs text-gray-600 mb-3">PDF only • Max 5MB</p>
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          uploading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                        }`}>
                          {uploading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Choose File
                            </>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* No Resume Warning */}
                  <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-5 border-2 border-yellow-200">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <TriangleAlert className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">No Resume Uploaded</h4>
                        <p className="text-xs text-gray-600">Upload your resume to start applying for companies</p>
                      </div>
                    </div>
                  </div>

                  {/* Upload Resume */}
                  <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 hover:border-indigo-500 transition-colors bg-indigo-50/50">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 mb-2">Upload Your Resume</h4>
                      <p className="text-sm text-gray-600 mb-4">PDF files only • Maximum size: 5MB</p>
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
                              <Loader2 className="animate-spin h-4 w-4" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Choose File
                            </>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Need to update your information?</p>
            <p className="text-sm text-blue-700 mt-1">
              Click the &quot;Edit Profile&quot; button above to request changes to your enrollment number, branch, CGPA, or backlog count. All changes require admin approval.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
