import Badge from '@/components/ui/Badge'
import { ArrowLeft, FileText } from 'lucide-react'

export default function ApplicationHeader({ application, onBack, getStatusColor, statusIcons }) {
  const StatusIcon = statusIcons?.[application.status] || FileText

  return (
    <div className="animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Applications
      </button>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Details</h1>
          <p className="text-gray-600">Track your application status and details</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-8 h-8 text-indigo-700" />
          <Badge variant={getStatusColor(application.status)} className="text-base px-4 py-2">
            {application.status}
          </Badge>
        </div>
      </div>
    </div>
  )
}
