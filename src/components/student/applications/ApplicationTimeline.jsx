import Card from '@/components/ui/Card'

export default function ApplicationTimeline({ application, formatDate, getStatusIcon }) {
  return (
    <Card className="animate-scale-in">
      <div className="border-l-4 border-indigo-500 pl-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Application Submitted</p>
              <p className="text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
            </div>
          </div>
          
          {application.status !== 'APPLIED' && (
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                application.status === 'SELECTED' ? 'bg-green-100' :
                application.status === 'REJECTED' ? 'bg-red-100' :
                application.status === 'SHORTLISTED' ? 'bg-blue-100' :
                'bg-yellow-100'
              }`}>
                <span className="text-xl">{getStatusIcon(application.status)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Status Updated to {application.status}</p>
                <p className="text-sm text-gray-600">{formatDate(application.lastUpdatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
