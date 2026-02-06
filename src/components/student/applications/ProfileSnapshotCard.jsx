import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default function ProfileSnapshotCard({ snapshot }) {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Your Profile Snapshot</h3>
          <p className="text-sm text-gray-600">Profile data at the time of application</p>
        </div>
        <div className="text-3xl">👤</div>
      </div>

      <div className="space-y-4">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">🎓 Branch</span>
            <Badge variant="primary" className="text-base px-4 py-1">
              {snapshot.branch}
            </Badge>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">📊 CGPA</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-600">
                {snapshot.cgpa.toFixed(2)}
              </span>
              <span className="text-sm text-gray-600">/ 10.0</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">⚠️ Backlogs</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${
                snapshot.backlogCount === 0 ? 'text-green-600' :
                snapshot.backlogCount <= 2 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {snapshot.backlogCount}
              </span>
            </div>
          </div>
        </div>

        {/* Eligibility Check */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-1">Eligibility Met</h4>
              <p className="text-sm text-green-700">
                You met all the eligibility criteria at the time of application.
              </p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-xl">ℹ️</div>
            <div>
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This snapshot represents your profile data at the time you applied. 
                Any changes to your profile after application won't affect this application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
