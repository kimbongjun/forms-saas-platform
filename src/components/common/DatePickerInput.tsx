'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function toDate(value: string | null | undefined) {
  if (!value) return undefined
  return parseISO(`${value}T00:00:00`)
}

function toValue(date: Date | undefined) {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd')
}

function formatLabel(date: Date | undefined, placeholder: string) {
  if (!date) return placeholder
  return format(date, 'yyyy년 M월 d일', { locale: ko })
}

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, onClose])

  return ref
}

const baseDayPickerClassNames = {
  // root에 rdp-root 사용 시 globals.css의 react-day-picker/style.css와 충돌 → 빈 문자열로 격리
  root: '',
  // months는 relative 필수 — v9에서 nav가 months의 자식으로 렌더링됨
  months: 'relative',
  month: 'space-y-4',
  // month_caption: px-10으로 양쪽 nav 버튼(32px + 패딩) 공간 확보
  month_caption: 'flex h-10 items-center justify-center px-10',
  // caption_label: captionLayout="dropdown"에서 각 드롭다운의 visible 레이블로 사용됨
  // dropdown_root 안에서 aria-hidden으로 렌더링되어 select 위에 표시
  caption_label: 'inline-flex items-center gap-1 px-2.5 py-1 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg pointer-events-none',
  chevron: 'h-3.5 w-3.5 opacity-50 flex-shrink-0',
  // nav: months 기준 절대 위치로 좌우 화살표 배치
  nav: 'absolute top-0 inset-x-0 flex h-10 items-center justify-between px-1',
  button_previous: 'flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
  button_next: 'flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
  // dropdown_root: 각 드롭다운(월/년)의 wrapper — relative 필수 (invisible select 절대위치 기준점)
  dropdown_root: 'relative inline-flex items-center',
  // dropdown: 실제 <select> 요소 — 투명 오버레이로 사용자 인터랙션 담당, caption_label이 visible 표시
  dropdown: 'absolute inset-0 w-full opacity-0 cursor-pointer z-10',
  dropdowns: 'flex items-center gap-2',
  months_dropdown: '',
  years_dropdown: '',
  month_grid: 'w-full border-collapse',
  weekdays: 'grid grid-cols-7 gap-1',
  weekday: 'py-2 text-center text-xs font-semibold text-gray-400',
  week: 'mt-1 grid grid-cols-7 gap-1',
  // day(td)에 modifier 클래스(selected 등)가 적용됨, day_button은 별도 클래스만
  day: 'h-10 w-10 p-0 font-medium',
  day_button: 'h-10 w-10 rounded-full text-sm transition-colors hover:bg-gray-100 hover:text-gray-900',
  today: '',
  outside: 'opacity-30',
  disabled: 'opacity-30 cursor-not-allowed',
  selected: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700',
  range_start: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:rounded-full [&>button]:hover:bg-blue-700',
  range_end: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:rounded-full [&>button]:hover:bg-blue-700',
  range_middle: 'bg-blue-50 [&>button]:rounded-none [&>button]:hover:bg-blue-100',
}

interface DatePickerInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: string
  max?: string
  className?: string
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = '날짜 선택',
  min,
  max,
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useOutsideClose(open, () => setOpen(false))
  const selected = useMemo(() => toDate(value), [value])
  const disabledDays = useMemo(() => {
    const matchers = []
    if (min) matchers.push({ before: toDate(min)! })
    if (max) matchers.push({ after: toDate(max)! })
    return matchers.length > 0 ? matchers : undefined
  }, [max, min])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-300"
      >
        <span className={cn(selected ? 'text-gray-900' : 'text-gray-400')}>
          {formatLabel(selected, placeholder)}
        </span>
        <CalendarDays className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-40 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
          <DayPicker
            locale={ko}
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(toValue(date))
              if (date) setOpen(false)
            }}
            captionLayout="dropdown"
            startMonth={min ? toDate(min) : new Date(new Date().getFullYear() - 10, 0, 1)}
            endMonth={max ? toDate(max) : new Date(new Date().getFullYear() + 5, 11, 31)}
            disabled={disabledDays}
            classNames={baseDayPickerClassNames}
            components={{
              Chevron: ({ orientation, className: iconClassName }) =>
                orientation === 'left' ? <ChevronLeft className={iconClassName} />
                : orientation === 'down' ? <ChevronDown className={iconClassName} />
                : <ChevronRight className={iconClassName} />,
            }}
          />
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">YYYY-MM-DD 형식으로 저장됩니다.</p>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                초기화
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface DateRangePickerInputProps {
  from: string
  to: string
  onChange: (value: { from: string; to: string }) => void
  placeholder?: string
  className?: string
}

export function DateRangePickerInput({
  from,
  to,
  onChange,
  placeholder = '기간 선택',
  className,
}: DateRangePickerInputProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useOutsideClose(open, () => setOpen(false))
  const selected = useMemo<DateRange | undefined>(() => ({
    from: toDate(from),
    to: toDate(to),
  }), [from, to])

  const label = useMemo(() => {
    if (selected?.from && selected?.to) {
      return `${format(selected.from, 'yyyy년 M월 d일', { locale: ko })} - ${format(selected.to, 'yyyy년 M월 d일', { locale: ko })}`
    }
    if (selected?.from) {
      return `${format(selected.from, 'yyyy년 M월 d일', { locale: ko })} - 종료일 선택`
    }
    return placeholder
  }, [placeholder, selected])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-300"
      >
        <span className={cn(selected?.from ? 'text-gray-900' : 'text-gray-400')}>{label}</span>
        <CalendarDays className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-40 rounded-[28px] border border-gray-200 bg-white p-4 shadow-2xl">
          <DayPicker
            locale={ko}
            mode="range"
            selected={selected}
            onSelect={(range) => {
              onChange({
                from: toValue(range?.from),
                to: toValue(range?.to),
              })
            }}
            captionLayout="dropdown"
            startMonth={new Date(new Date().getFullYear() - 10, 0, 1)}
            endMonth={new Date(new Date().getFullYear() + 5, 11, 31)}
            numberOfMonths={1}
            classNames={baseDayPickerClassNames}
            components={{
              Chevron: ({ orientation, className: iconClassName }) =>
                orientation === 'left' ? <ChevronLeft className={iconClassName} />
                : orientation === 'down' ? <ChevronDown className={iconClassName} />
                : <ChevronRight className={iconClassName} />,
            }}
          />
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">
              {from && to ? `${from} - ${to}` : '시작일과 종료일을 순서대로 선택하세요.'}
            </p>
            {(from || to) && (
              <button
                type="button"
                onClick={() => onChange({ from: '', to: '' })}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                초기화
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
