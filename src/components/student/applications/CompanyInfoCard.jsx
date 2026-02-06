import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

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
        <div className="text-3xl">🏢</div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">💰 Package (CTC)</span>
          <span className="text-xl font-bold text-indigo-600">
            {formatCurrency(company.ctc)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">📚 Eligible Branches</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {company.eligibleBranches.map((branch) => (
              <Badge key={branch} variant="default" className="text-xs">
                {branch}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">📊 Minimum CGPA</span>
          <span className="font-semibold text-gray-900">
            {company.minCgpa.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">⚠️ Max Backlogs Allowed</span>
          <span className="font-semibold text-gray-900">
            {company.backlogCount}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600 font-medium">📅 Application Deadline</span>
          <span className="font-semibold text-gray-900">
            {new Date(company.applicationDeadline).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex justify-between items-center py-3">
          <span className="text-gray-600 font-medium">🚦 Company Status</span>
          <Badge variant={company.status === 'OPEN' ? 'success' : 'danger'}>
            {company.status}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
