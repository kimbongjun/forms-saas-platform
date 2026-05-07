'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, CalendarDays, Cpu, LayoutDashboard } from 'lucide-react'

const TABS = [
  { href: '/market', label: 'Daily Report', icon: LayoutDashboard },
  { href: '/market/competitors', label: 'Competitors', icon: Building2 },
  { href: '/market/tech-ai', label: 'Tech & AI', icon: Cpu },
  { href: '/market/events', label: 'Events', icon: CalendarDays },
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
