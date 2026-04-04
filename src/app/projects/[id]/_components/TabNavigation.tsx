'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface TabNavigationProps {
  projectId: string
}

export default function TabNavigation({ projectId }: TabNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [executionOpen, setExecutionOpen] = useState(false)
  const [outputsOpen, setOutputsOpen] = useState(false)
  const executionRef = useRef<HTMLDivElement>(null)
  const outputsRef = useRef<HTMLDivElement>(null)

  const baseUrl = `/projects/${projectId}`
  const isOverview = pathname === baseUrl
  const isSchedule = pathname.startsWith(`${baseUrl}/schedule`)
  const isExecution = pathname.startsWith(`${baseUrl}/execution`)
  const isIssues = pathname.startsWith(`${baseUrl}/issues`)
  const isBudget = pathname.startsWith(`${baseUrl}/budget`)
  const isOutputs = pathname.startsWith(`${baseUrl}/outputs`)
  const isInsights = pathname.startsWith(`${baseUrl}/insights`)

  const showExecutionMenu = executionOpen || isExecution
  const showOutputsMenu = outputsOpen || isOutputs

  const executionLinks = [
    { href: `${baseUrl}/execution/forms`, label: '폼/서베이 관리' },
    { href: `${baseUrl}/execution/tasks`, label: 'Task & WBS' },
  ]

  const outputsLinks = [
    { href: `${baseUrl}/outputs/deliverables`, label: '산출물 관리' },
    { href: `${baseUrl}/outputs/clippings`, label: '보도자료 클리핑' },
  ]

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (executionRef.current && !executionRef.current.contains(event.target as Node)) {
        setExecutionOpen(false)
      }
      if (outputsRef.current && !outputsRef.current.contains(event.target as Node)) {
        setOutputsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleExecutionClick() {
    setOutputsOpen(false)
    if (!executionOpen) {
      setExecutionOpen(true)
      if (!isExecution) router.push(executionLinks[0].href)
      return
    }
    setExecutionOpen(false)
  }

  function handleOutputsClick() {
    setExecutionOpen(false)
    if (!outputsOpen) {
      setOutputsOpen(true)
      if (!isOutputs) router.push(outputsLinks[0].href)
      return
    }
    setOutputsOpen(false)
  }

  const tabClass = (active: boolean) =>
    [
      'px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap',
      active
        ? 'bg-gray-900 text-white'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
    ].join(' ')

  const subTabClass = (active: boolean) =>
    [
      'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
      active
        ? 'bg-gray-900 text-white'
        : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900',
    ].join(' ')

  const activeSubMenu = showExecutionMenu ? executionLinks : showOutputsMenu ? outputsLinks : null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <Link href={baseUrl} className={tabClass(isOverview)}>
          개요
        </Link>
        <Link href={`${baseUrl}/schedule`} className={tabClass(isSchedule)}>
          일정
        </Link>
        <Link href={`${baseUrl}/budget`} className={tabClass(isBudget)}>
          예산
        </Link>
        <button type="button" onClick={handleExecutionClick} className={tabClass(isExecution)}>
          운영
        </button>
        <Link href={`${baseUrl}/issues`} className={tabClass(isIssues)}>
          이슈 트래커
        </Link>
        <button type="button" onClick={handleOutputsClick} className={tabClass(isOutputs)}>
          산출물
        </button>
        <Link href={`${baseUrl}/insights`} className={tabClass(isInsights)}>
          인사이트
        </Link>
      </div>

      {activeSubMenu && (
        <div
          ref={showExecutionMenu ? executionRef : outputsRef}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2"
        >
          {activeSubMenu.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={subTabClass(active)}>
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
