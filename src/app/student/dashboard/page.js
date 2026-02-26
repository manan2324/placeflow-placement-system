"use client"
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StudentLayout from '@/components/layouts/StudentLayout'
import StudentDashboardHeader from '@/components/student/dashboard/StudentDashboardHeader'
import StudentStatsGrid from '@/components/student/dashboard/StudentStatsGrid'
import RecentApplicationsCard from '@/components/student/dashboard/RecentApplicationsCard'
import { StudentDashboardSkeleton } from '@/components/ui/Skeleton'
import { getStudentDashboard, getStudentApplications } from '@/services/student.api'
import { useAuthStore } from '@/store/authStore'

export default function StudentDashboard() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
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
  }, [router, setAuth])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Stable navigation callbacks – prevent unnecessary child re-renders
  const handleBrowseCompanies = useCallback(() => router.push('/student/companies'), [router])
  const handleOpenApplication = useCallback((id) => router.push(`/student/applications/${id}`), [router])
  const handleViewAll = useCallback(() => router.push('/student/applications'), [router])

  if (loading) {
    return (
      <StudentLayout>
        <StudentDashboardSkeleton />
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
          onBrowseCompanies={handleBrowseCompanies}
          onOpenApplication={handleOpenApplication}
          onViewAll={handleViewAll}
        />
      </div>
    </StudentLayout>
  )
}
