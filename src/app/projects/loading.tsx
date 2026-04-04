import {
  CardGridSkeleton,
  HeaderSkeleton,
  SectionSkeleton,
} from '@/components/common/LoadingSkeleton'

export default function ProjectsLoading() {
  return (
    <div className="space-y-4">
      <HeaderSkeleton />
      <SectionSkeleton titleWidth="w-28" lines={2} />
      <CardGridSkeleton count={6} />
    </div>
  )
}
