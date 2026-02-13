"use client"
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import StudentLayout from '@/components/layouts/StudentLayout'
import Button from '@/components/ui/Button'
import { getStudentApplicationById } from '@/services/student.api'
import ApplicationHeader from '@/components/student/applications/ApplicationHeader'
import ApplicationTimeline from '@/components/student/applications/ApplicationTimeline'
import CompanyInfoCard from '@/components/student/applications/CompanyInfoCard'
import ProfileSnapshotCard from '@/components/student/applications/ProfileSnapshotCard'
import StatusMessageCard from '@/components/student/applications/StatusMessageCard'
import LoadingState from '@/components/student/applications/LoadingState'
import ErrorState from '@/components/student/applications/ErrorState'
import NotFoundState from '@/components/student/applications/NotFoundState'
import { FileText, Clock3, ClipboardList, CheckCircle2, XCircle } from 'lucide-react'

const STATUS_ICONS = {
  APPLIED: FileText,
  PENDING: Clock3,
  SHORTLISTED: ClipboardList,
  SELECTED: CheckCircle2,
  REJECTED: XCircle,
}

export default function ApplicationDetailsPage({ params }) {
  const router = useRouter()
  const { id } = use(params)
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchApplicationDetails()
  }, [id])

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      const res = await getStudentApplicationById(id)
      setApplication(res.data)
    } catch (error) {
      console.error('Failed to fetch application:', error)
      setError(error.response?.data?.message || 'Failed to fetch application details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      APPLIED: 'info',
      PENDING: 'warning',
      SHORTLISTED: 'primary',
      SELECTED: 'success',
      REJECTED: 'danger',
    }
    return colors[status] || 'default'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onBack={() => router.push('/student/applications')} />
  if (!application) return <NotFoundState onBack={() => router.push('/student/applications')} />

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <ApplicationHeader 
          application={application}
          onBack={() => router.back()}
          getStatusColor={getStatusColor}
          statusIcons={STATUS_ICONS}
        />

        <ApplicationTimeline 
          application={application}
          formatDate={formatDate}
          statusIcons={STATUS_ICONS}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompanyInfoCard 
            company={application.company}
            formatCurrency={formatCurrency}
          />

          <ProfileSnapshotCard 
            snapshot={application.snapshot}
          />
        </div>

        <StatusMessageCard 
          status={application.status}
          companyName={application.company.name}
          onExploreMore={() => router.push('/student/companies')}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            onClick={() => router.push('/student/applications')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            View All Applications
          </Button>
          <Button 
            onClick={() => router.push('/student/companies')}
            className="w-full sm:w-auto"
          >
            Browse More Companies
          </Button>
        </div>
      </div>
    </StudentLayout>
  )
}
