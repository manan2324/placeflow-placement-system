import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PartyPopper, Target, Dumbbell, Clock3 } from 'lucide-react'

export default function StatusMessageCard({ status, companyName, onExploreMore }) {
  if (status === 'SELECTED') {
    return (
      <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 animate-bounce-soft">
        <div className="flex items-start gap-4">
          <PartyPopper className="h-12 w-12 text-green-700" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h3>
            <p className="text-green-700 text-lg">
              You have been selected by <strong>{companyName}</strong>! 
              Get ready for an amazing career opportunity. Please check your email for further instructions.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === 'SHORTLISTED') {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <Target className="h-12 w-12 text-blue-700" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">You&apos;ve Been Shortlisted!</h3>
            <p className="text-blue-700 text-lg">
              Great news! You&apos;ve been shortlisted for the next round at <strong>{companyName}</strong>. 
              Keep an eye on your email for interview details and next steps.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === 'REJECTED') {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <div className="flex items-start gap-4">
          <Dumbbell className="h-12 w-12 text-red-700" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-red-800 mb-2">Application Not Selected</h3>
            <p className="text-red-700 text-lg mb-3">
              Unfortunately, your application for <strong>{companyName}</strong> wasn&apos;t selected this time. 
            </p>
            <p className="text-red-600">
              Don&apos;t be discouraged! Every rejection is a step closer to success. Keep applying and improving your skills.
            </p>
            <Button 
              onClick={onExploreMore}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Explore More Opportunities
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (status === 'APPLIED') {
    return (
      <Card className="bg-yellow-50 border-2 border-yellow-200">
        <div className="flex items-start gap-4">
          <Clock3 className="h-12 w-12 text-yellow-700" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-800 mb-2">Application Under Review</h3>
            <p className="text-yellow-700 text-lg">
              Your application has been submitted successfully and is currently under review by <strong>{companyName}</strong>. 
              We&apos;ll notify you once there&apos;s an update. Good luck!
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
