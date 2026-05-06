'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Cpu, Users, CalendarDays } from 'lucide-react'

const TABS = [
  { href: '/market', label: 'Daily Report', icon: LayoutDashboard, description: '오늘의 동향 요약' },
  { href: '/market/tech-ai', label: 'Tech & AI', icon: Cpu, description: '기술 · AI · 규제 동향' },
  { href: '/market/marketing-influencer', label: 'Marketing & KOL', icon: Users, description: '캠페인 · 인플루언서 · SNS' },
  { href: '/market/events', label: 'Events', icon: CalendarDays, description: '전시 · 학회 일정' },
]

export default function MarketNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex overflow-x-auto px-6">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === '/market' ? pathname === '/market' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors',
                active
                  ? 'border-[#002D74] text-[#002D74]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
