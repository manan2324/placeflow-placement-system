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
import { formatDate } from '@/utils/date'

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
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:bg-gray-50">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm sm:text-base font-semibold text-gray-900 wrap-break-word flex items-center gap-2">
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
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -top-16 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-sm sm:h-20 sm:w-20 sm:text-3xl">
                {profile?.userId?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{profile?.userId?.name || 'Student'}</h1>
                <p className="mt-1 truncate text-sm text-indigo-100 sm:text-base">{profile?.userId?.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* <Badge variant="success" className="bg-white/20 text-white border border-white/30">
                    Active
                  </Badge> */}  
                  {profile?.resumeUrl && (
                    <Badge variant="success" className="bg-green-500/90 text-white">
                      Resume Uploaded
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/student/profile/edit')}
              className="w-full shrink-0 border-white/40 bg-white/10 text-white hover:bg-white/20 sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Academic Information</h2>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
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

            <Card className="border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Account Details</h2>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
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

          <div className="lg:col-span-4">
            <Card className="border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Resume</h2>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
              </div>

              {profile?.resumeUrl ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-green-50 p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="shrink-0 w-11 h-11 rounded-full bg-white flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Resume Active</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Updated {formatDate(profile.resumeUpdatedAt) || 'recently'}
                        </p>
                      </div>
                    </div>
                    <ResumeViewer 
                      resumeId={profile.resumeUrl} 
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-50"
                    />
                  </div>

                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-indigo-400">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100">
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
                  <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-11 h-11 bg-white rounded-full flex items-center justify-center">
                        <TriangleAlert className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">No Resume Uploaded</h4>
                        <p className="text-xs text-gray-600">Upload your resume to start applying for companies</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 p-6 transition-colors hover:border-indigo-400">
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
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]'
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

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Need to update your information?</p>
            <p className="text-sm text-blue-700 mt-1">
              Click the &quot;Edit Profile&quot; button above to request changes to your enrollment number, branch, CGPA, or backlog count. All changes require admin approval.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
