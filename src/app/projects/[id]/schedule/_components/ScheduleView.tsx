'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, List, ChevronLeft, ChevronRight } from 'lucide-react'

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface Task {
  id: string
  title: string
  assignee: string | null
  due_date: string | null
  status: 'todo' | 'in_progress' | 'done' | 'hold'
}

interface ScheduleViewProps {
  tasks: Task[]
}

// ── 상수 ──────────────────────────────────────────────────────────────────────

const STATUS_META: Record<Task['status'], { label: string; dot: string; badge: string }> = {
  todo:        { label: '예정',    dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600' },
  in_progress: { label: '진행 중', dot: 'bg-blue-400',    badge: 'bg-blue-100 text-blue-700' },
  done:        { label: '완료',    dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  hold:        { label: '보류',    dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700' },
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function toLocalDate(str: string) {
  // "YYYY-MM-DD" 형식을 로컬 시간 기준으로 파싱
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ── CalendarView ──────────────────────────────────────────────────────────────

function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  // 이번 달 달력 그리드 계산
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() // 0=일

    const days: (Date | null)[] = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    // 6줄 고정
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [year, month])

  // 날짜별 태스크 맵
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.due_date) continue
      const key = t.due_date.slice(0, 10) // YYYY-MM-DD
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [tasks])

  function dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const selectedTasks = selectedDay ? (tasksByDay.get(dateKey(selectedDay)) ?? []) : []

  return (
    <div className="space-y-4">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
        <button type="button" onClick={prevMonth} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold text-gray-900">
          {year}년 {month + 1}월
        </span>
        <button type="button" onClick={nextMonth} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="rounded-[24px] border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_OF_WEEK.map((d, i) => (
            <div
              key={d}
              className={[
                'py-2.5 text-center text-xs font-semibold',
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400',
              ].join(' ')}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-gray-50 last:border-r-0" />
            }
            const key = dateKey(day)
            const dayTasks = tasksByDay.get(key) ?? []
            const isToday = isSameDay(day, today)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const isSunday = day.getDay() === 0
            const isSaturday = day.getDay() === 6

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={[
                  'min-h-[80px] border-b border-r border-gray-100 p-2 text-left transition-colors last:border-r-0 hover:bg-gray-50',
                  isSelected ? 'bg-gray-50 ring-2 ring-inset ring-gray-900' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    isToday ? 'bg-gray-900 text-white' : isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700',
                  ].join(' ')}
                >
                  {day.getDate()}
                </span>

                {/* 태스크 도트 */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_META[t.status].dot}`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{dayTasks.length - 3}</span>
                  )}
                </div>

                {/* 태스크 미리보기 (스크린 여유 있을 때) */}
                <div className="mt-1 hidden sm:block space-y-0.5">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${STATUS_META[t.status].badge}`}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="text-[10px] text-gray-400">+{dayTasks.length - 2}개</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택된 날짜의 태스크 상세 */}
      {selectedDay && (
        <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">
            {selectedDay.getMonth() + 1}월 {selectedDay.getDate()}일 ({DAYS_OF_WEEK[selectedDay.getDay()]})
          </p>
          {selectedTasks.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">이 날짜에 마감인 태스크가 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[t.status].dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
                    {t.assignee && <p className="text-xs text-gray-400">{t.assignee}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_META[t.status].badge}`}>
                    {STATUS_META[t.status].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── ListView ──────────────────────────────────────────────────────────────────

function ListView({ tasks }: { tasks: Task[] }) {
  // due_date 기준 정렬: null은 맨 뒤
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0
    })
  }, [tasks])

  // 날짜별 그룹핑
  const groups = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of sorted) {
      const key = t.due_date?.slice(0, 10) ?? '날짜 미정'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [sorted])

  const today = new Date()

  function formatGroupLabel(key: string) {
    if (key === '날짜 미정') return '날짜 미정'
    const d = toLocalDate(key)
    const isToday = isSameDay(d, today)
    const isPast = d < today && !isToday
    const dateStr = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(d)
    if (isToday) return `오늘 · ${dateStr}`
    if (isPast) return `지남 · ${dateStr}`
    return dateStr
  }

  function isGroupPast(key: string) {
    if (key === '날짜 미정') return false
    const d = toLocalDate(key)
    const isToday = isSameDay(d, today)
    return d < today && !isToday
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white py-16 text-center shadow-sm">
        <p className="text-sm text-gray-400">등록된 태스크가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([key, groupTasks]) => (
        <div key={key}>
          <div className="mb-2 flex items-center gap-2">
            <p className={[
              'text-xs font-semibold',
              isGroupPast(key) ? 'text-red-400' : 'text-gray-500',
            ].join(' ')}>
              {formatGroupLabel(key)}
            </p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {groupTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {groupTasks.map((t) => (
              <div
                key={t.id}
                className={[
                  'flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm',
                  isGroupPast(key) ? 'border-gray-100 opacity-60' : 'border-gray-200',
                ].join(' ')}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_META[t.status].dot}`} />
                <div className="min-w-0 flex-1">
                  <p className={[
                    'truncate text-sm font-medium',
                    t.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900',
                  ].join(' ')}>
                    {t.title}
                  </p>
                  {t.assignee && (
                    <p className="mt-0.5 text-xs text-gray-400">{t.assignee}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_META[t.status].badge}`}>
                  {STATUS_META[t.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ScheduleView (메인) ───────────────────────────────────────────────────────

export default function ScheduleView({ tasks }: ScheduleViewProps) {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const tasksWithDate = tasks.filter((t) => t.due_date)
  const noDateCount = tasks.length - tasksWithDate.length

  return (
    <div className="space-y-4">
      {/* 상단 헤더 + 뷰 전환 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            태스크 {tasks.length}개
            {noDateCount > 0 && <span className="ml-1.5 text-gray-400">· 날짜 미정 {noDateCount}개</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              view === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900',
            ].join(' ')}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            캘린더
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900',
            ].join(' ')}
          >
            <List className="h-3.5 w-3.5" />
            리스트
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView tasks={tasks} />
      ) : (
        <ListView tasks={tasks} />
      )}
    </div>
  )
}
