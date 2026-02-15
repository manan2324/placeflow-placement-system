"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getCompanies, applyToCompany } from '@/services/student.api'
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react'
import { formatDateTime } from '@/utils/date'

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(res.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (companyId) => {
    setApplying(companyId)
    try {
      await applyToCompany(companyId)
      toast.success('Application submitted successfully!')
      fetchCompanies() // Refresh to update applied status
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to apply'
      toast.error(errorMsg)
    } finally {
      setApplying(null)
    }
  }

  // Get effective status considering deadline
  const getEffectiveStatus = (company) => {
    if (company.status === 'CLOSED') return 'CLOSED'
    if (company.applicationDeadline && new Date(company.applicationDeadline) <= new Date()) {
      return 'CLOSED'
    }
    return company.status
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
        <div className="animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Browse and apply to available companies</p>
        </div>

        {companies.length === 0 ? (
          <Card>
            <div className="text-center py-8 sm:py-12">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <p className="text-gray-500 text-base sm:text-lg">No companies available</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {companies.map((company) => (
              <Card
                key={company._id}
                className="hover:shadow-xl transition-all duration-200 border-2 border-indigo-200 hover:border-indigo-300"
              >
                <div className="space-y-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-200">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                      <p className="text-sm sm:text-base text-indigo-600 font-medium">{company.role}</p>
                    </div>
                    {getEffectiveStatus(company) === 'OPEN' ? (
                      <Badge variant="success" className="shrink-0">Open</Badge>
                    ) : (
                      <Badge variant="danger" className="shrink-0">Closed</Badge>
                    )}
                  </div>

                  {/* CTC Section */}
                  <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Annual CTC</p>
                    <p className="text-xl sm:text-2xl font-bold text-indigo-700">₹{company.ctc} LPA</p>
                  </div>

                  {/* Eligibility Criteria */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 min-w-22.5">Min CGPA:</span>
                      <span className="text-gray-900 font-medium">{company.minCgpa}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 min-w-22.5">Backlogs:</span>
                      {company.backlogCount === 0 ? (
                        <Badge variant="danger" className="text-xs">Not Allowed</Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">Max {company.backlogCount} Allowed</Badge>
                      )}
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-22.5">Branches:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {company.eligibleBranches?.map((branch, idx) => (
                          <Badge key={idx} variant="default" className="text-xs">{branch}</Badge>
                        ))}
                      </div>
                    </div>

                    {company.applicationDeadline && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-700 min-w-22.5">Deadline:</span>
                        <span className="text-gray-900 font-medium">
                          {formatDateTime(company.applicationDeadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <Button
                    onClick={() => handleApply(company._id)}
                    disabled={getEffectiveStatus(company) !== 'OPEN' || applying === company._id || company.hasApplied}
                    className="w-full text-sm sm:text-base py-2.5 sm:py-3 font-semibold"
                  >
                    {applying === company._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </span>
                    ) : company.hasApplied ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Already Applied
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
