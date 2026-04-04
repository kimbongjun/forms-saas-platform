import {
  HeaderSkeleton,
  SectionSkeleton,
  TableRowSkeleton,
} from '@/components/common/LoadingSkeleton'

export default function ReleaseNotesLoading() {
  return (
    <div className="space-y-5">
      <HeaderSkeleton />
      <SectionSkeleton titleWidth="w-48" lines={3} />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRowSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
