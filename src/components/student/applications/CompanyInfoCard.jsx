import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Building2, IndianRupee, BookOpen, BarChart3, TriangleAlert, CalendarDays, Activity } from 'lucide-react'

export default function CompanyInfoCard({ company, formatCurrency }) {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {company.name}
          </h3>
          <p className="text-gray-600">{company.role}</p>
        </div>
        <Building2 className="h-8 w-8 text-gray-700" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium inline-flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Package (CTC)</span>
          <span className="text-xl font-bold text-indigo-600">
            {formatCurrency(company.ctc)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Eligible Branches</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {company.eligibleBranches.map((branch) => (
              <Badge key={branch} variant="default" className="text-xs">
                {branch}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium inline-flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Minimum CGPA</span>
          <span className="font-semibold text-gray-900">
            {company.minCgpa.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium inline-flex items-center gap-2"><TriangleAlert className="w-4 h-4" /> Max Backlogs Allowed</span>
          <span className="font-semibold text-gray-900">
            {company.backlogCount}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium inline-flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Application Deadline</span>
          <span className="font-semibold text-gray-900">
            {new Date(company.applicationDeadline).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex justify-between items-center py-3">
          <span className="text-gray-600 font-medium inline-flex items-center gap-2"><Activity className="w-4 h-4" /> Company Status</span>
          <Badge variant={company.status === 'OPEN' ? 'success' : 'danger'}>
            {company.status}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
