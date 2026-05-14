'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Cpu, LayoutDashboard, Users } from 'lucide-react'
import MarketRefreshButton from './MarketRefreshButton'

const TABS = [
  { href: '/market', label: 'Daily Report', icon: LayoutDashboard },
  { href: '/market/tech-ai', label: 'Tech & AI', icon: Cpu },
  { href: '/market/events', label: 'Events', icon: CalendarDays },
  { href: '/market/marketing-influencer', label: 'KOL & Campaigns', icon: Users },
]

export default function MarketNav() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-2 sm:px-6">
        <div className="flex overflow-x-auto">
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
        <div className="shrink-0 pr-2 sm:pr-0">
          <MarketRefreshButton />
        </div>
      </div>
    </nav>
  )
}
