import { HeaderSkeleton, SectionSkeleton } from '@/components/common/LoadingSkeleton'

export default function NewFormLoading() {
  return (
    <div className="space-y-5">
      <HeaderSkeleton />
      <SectionSkeleton titleWidth="w-48" lines={6} />
    </div>
  )
}
