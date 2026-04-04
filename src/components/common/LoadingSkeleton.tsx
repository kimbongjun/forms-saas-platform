import { Loader2 } from 'lucide-react'

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function SkeletonBlock({
  className,
}: {
  className?: string
}) {
  return <div className={classes('animate-pulse rounded-xl bg-gray-200/80', className)} />
}

export function SectionSkeleton({
  titleWidth = 'w-40',
  lines = 3,
}: {
  titleWidth?: string
  lines?: number
}) {
  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
      <SkeletonBlock className={classes('h-6', titleWidth)} />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className={classes('h-4', index === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>
    </section>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="mt-4 h-8 w-24" />
      <SkeletonBlock className="mt-3 h-4 w-32" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-[1.5fr,1fr,1fr,auto] items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-9 w-24" />
    </div>
  )
}

export function CardGridSkeleton({
  count = 6,
}: {
  count?: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-12 rounded-full" />
          </div>
          <SkeletonBlock className="mt-4 h-6 w-3/4" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </div>
          <div className="mt-5 flex gap-2">
            <SkeletonBlock className="h-9 flex-1" />
            <SkeletonBlock className="h-9 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="mt-3 h-8 w-64" />
      <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
    </div>
  )
}

export function InlineSpinner({
  label = '불러오는 중...',
}: {
  label?: string
}) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-gray-200 bg-white px-6 py-12 shadow-sm">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        <span>{label}</span>
      </div>
    </div>
  )
}
