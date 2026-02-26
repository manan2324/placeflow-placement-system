import Card from '@/components/ui/Card'
import { Check, FileText } from 'lucide-react'

export default function ApplicationTimeline({ application, formatDate, statusIcons }) {
  const StatusIcon = statusIcons?.[application.status] || FileText

  return (
    <Card className="animate-scale-in">
      <div className="border-l-4 border-indigo-500 pl-6 py-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold text-gray-900">Application Submitted</p>
              <p className="text-xs sm:text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
            </div>
          </div>
          
          {application.status !== 'APPLIED' && (
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                application.status === 'SELECTED' ? 'bg-green-100' :
                application.status === 'REJECTED' ? 'bg-red-100' :
                application.status === 'SHORTLISTED' ? 'bg-blue-100' :
                'bg-yellow-100'
              }`}>
                <StatusIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-semibold text-gray-900">Status Updated to {application.status}</p>
                <p className="text-xs sm:text-sm text-gray-600">{formatDate(application.lastUpdatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
