'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface TabNavigationProps {
  projectId: string
}

export default function TabNavigation({ projectId }: TabNavigationProps) {
  const pathname = usePathname()
  const [executionOpen, setExecutionOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const baseUrl = `/projects/${projectId}`
  const isOverview = pathname === baseUrl
  const isSchedule = pathname.startsWith(`${baseUrl}/schedule`)
  const isExecution = pathname.startsWith(`${baseUrl}/execution`)
  const isIssues = pathname.startsWith(`${baseUrl}/issues`)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExecutionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const tabClass = (active: boolean) =>
    [
      'px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap',
      active
        ? 'bg-gray-900 text-white'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
    ].join(' ')

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      <Link href={baseUrl} className={tabClass(isOverview)}>
        개요
      </Link>
      <Link href={`${baseUrl}/schedule`} className={tabClass(isSchedule)}>
        일정
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setExecutionOpen(!executionOpen)}
          className={[
            tabClass(isExecution),
            'flex items-center gap-1',
          ].join(' ')}
        >
          상세 실행
          <ChevronDown
            className={[
              'h-3.5 w-3.5 transition-transform',
              executionOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>
        {executionOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[176px] rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
            <p className="px-3 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              상세 실행
            </p>
            <span className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-300">
              산출물 관리
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
                준비중
              </span>
            </span>
            <Link
              href={`${baseUrl}/execution/forms`}
              onClick={() => setExecutionOpen(false)}
              className={[
                'flex items-center rounded-xl px-3 py-2 text-sm transition-colors',
                pathname.startsWith(`${baseUrl}/execution`)
                  ? 'bg-gray-900 font-semibold text-white'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              폼/서베이 관리
            </Link>
          </div>
        )}
      </div>

      <Link href={`${baseUrl}/issues`} className={tabClass(isIssues)}>
        이슈 트래커
      </Link>
    </div>
  )
}
