import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Frown } from 'lucide-react'

export default function ErrorState({ error, onBack }) {
  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <Frown className="h-14 w-14 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={onBack}>
            Back to Applications
          </Button>
        </Card>
      </div>
    </StudentLayout>
  )
}
