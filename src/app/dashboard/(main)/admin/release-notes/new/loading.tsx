import { HeaderSkeleton, SectionSkeleton } from '@/components/common/LoadingSkeleton'

export default function ReleaseNoteEditorLoading() {
  return (
    <div className="space-y-5">
      <HeaderSkeleton />
      <SectionSkeleton titleWidth="w-56" lines={8} />
    </div>
  )
}
