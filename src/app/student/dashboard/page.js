"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StudentLayout from '@/components/layouts/StudentLayout'
import StudentDashboardHeader from '@/components/student/dashboard/StudentDashboardHeader'
import StudentStatsGrid from '@/components/student/dashboard/StudentStatsGrid'
import RecentApplicationsCard from '@/components/student/dashboard/RecentApplicationsCard'
import QuickActionsCard from '@/components/student/dashboard/QuickActionsCard'
import { getStudentDashboard, getStudentApplications } from '@/services/student.api'
import { useAuthStore } from '@/store/authStore'

export default function StudentDashboard() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, applicationsRes] = await Promise.all([
        getStudentDashboard(),
        getStudentApplications()
      ])
      
      setStats(dashboardRes.data.data)
      setApplications(applicationsRes.data.slice(0, 5)) // Show latest 5
      
      // Update auth store if user data is present
      if (dashboardRes.data.data?.user) {
        setAuth({ 
          user: dashboardRes.data.data.user, 
          role: 'STUDENT' 
        })
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/auth/login')
      }
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <StudentDashboardHeader />

        <StudentStatsGrid stats={stats} />

        <RecentApplicationsCard
          applications={applications}
          onBrowseCompanies={() => router.push('/student/companies')}
          onOpenApplication={(id) => router.push(`/student/applications/${id}`)}
          onViewAll={() => router.push('/student/applications')}
        />

        {/* <QuickActionsCard
          onBrowseCompanies={() => router.push('/student/companies')}
          onUpdateProfile={() => router.push('/student/profile')}
          onViewApplications={() => router.push('/student/applications')}
        /> */}
      </div>
    </StudentLayout>
  )
}
