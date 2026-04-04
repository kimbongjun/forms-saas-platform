import { HeaderSkeleton, SectionSkeleton } from '@/components/common/LoadingSkeleton'

export default function NewProjectLoading() {
  return (
    <div className="space-y-5">
      <HeaderSkeleton />
      <SectionSkeleton titleWidth="w-64" lines={7} />
    </div>
  )
}
