'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, SquarePen } from 'lucide-react'
import { PROJECT_NAV_GROUPS } from '@/constants/ia'

interface ProjectSectionNavProps {
  projectId: string
  projectSlug: string
  fieldCount: number
  submissionCount: number
}

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function ProjectSectionNav({
  projectId,
  projectSlug,
  fieldCount,
  submissionCount,
}: ProjectSectionNavProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-6 lg:w-80">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Workspace</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Fields</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{fieldCount}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Responses</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{submissionCount}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href={`/projects/${projectId}/execution/forms`}
            className="flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <span>프로젝트 폼 열기</span>
            <SquarePen className="h-4 w-4" />
          </Link>          
          <Link
            href={`/${projectSlug}`}
            target="_blank"
            className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <span>페이지 보기</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm">
        {PROJECT_NAV_GROUPS.map((group) => (
          <div key={group.label} className="border-b border-gray-100 px-2 py-3 last:border-b-0">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const href = item.href(projectId)
                const active = matchesPath(pathname, href)

                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={[
                      'block rounded-2xl px-3 py-3 transition-colors',
                      active ? 'brand-active' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <p className={['text-sm font-semibold', active ? 'text-white' : 'text-gray-900'].join(' ')}>
                      {item.label}
                    </p>
                    <p className={['mt-1 text-xs', active ? 'text-gray-300' : 'text-gray-400'].join(' ')}>
                      {item.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
