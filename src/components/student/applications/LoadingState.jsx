import StudentLayout from '@/components/layouts/StudentLayout'
import { TablePageSkeleton } from '@/components/ui/Skeleton'

export default function LoadingState() {
  return (
    <StudentLayout>
      <TablePageSkeleton rows={5} />
    </StudentLayout>
  )
}
