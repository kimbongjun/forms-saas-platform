import { HeaderSkeleton, SectionSkeleton } from '@/components/common/LoadingSkeleton'

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-5">
      <HeaderSkeleton />
      <SectionSkeleton titleWidth="w-48" lines={10} />
    </div>
  )
}
