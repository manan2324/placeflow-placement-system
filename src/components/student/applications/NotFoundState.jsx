import StudentLayout from '@/components/layouts/StudentLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function NotFoundState({ onBack }) {
  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The application you're looking for doesn't exist.</p>
          <Button onClick={onBack}>
            Back to Applications
          </Button>
        </Card>
      </div>
    </StudentLayout>
  )
}
