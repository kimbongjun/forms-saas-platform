import {
  HeaderSkeleton,
  SectionSkeleton,
  StatCardSkeleton,
  TableRowSkeleton,
} from '@/components/common/LoadingSkeleton'

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-5">
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <SectionSkeleton titleWidth="w-52" lines={4} />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRowSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
