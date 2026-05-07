'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Calendar, Plus, X } from 'lucide-react'
import { DateRangePickerInput } from '@/components/common/DatePickerInput'

interface TopicGroup {
  id: string
  groupName: string
  keywords: string
}

type PeriodType = '1m' | '3m' | '1y' | 'all' | 'custom'
type DeviceType = '' | 'pc' | 'mo'
type GenderType = '' | 'm' | 'f'
type AgeType = 'all' | '1020' | '2030' | '3040' | '4050' | '60plus'

const AGE_MAP: Record<AgeType, string[]> = {
  all: [],
  '1020': ['2'],
  '2030': ['3', '4'],
  '3040': ['5', '6'],
  '4050': ['7', '8'],
  '60plus': ['11'],
}

const PERIOD_LABEL: Record<PeriodType, string> = {
  '1m': '1개월',
  '3m': '3개월',
  '1y': '1년',
  all: '전체',
  custom: '직접 입력',
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function buildDateRange(periodType: PeriodType, customStart: string, customEnd: string) {
  const today = new Date()
  const endDate = formatDate(today)

  if (periodType === 'custom') {
    const diffDays = (new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000
    return {
      startDate: customStart,
      endDate: customEnd,
      timeUnit: diffDays <= 31 ? 'date' : diffDays <= 120 ? 'week' : 'month',
    } as const
  }

  if (periodType === '1m') {
    const start = new Date(today)
    start.setMonth(start.getMonth() - 1)
    return { startDate: formatDate(start), endDate, timeUnit: 'date' } as const
  }

  if (periodType === '3m') {
    const start = new Date(today)
    start.setMonth(start.getMonth() - 3)
    return { startDate: formatDate(start), endDate, timeUnit: 'week' } as const
  }

  if (periodType === '1y') {
    const start = new Date(today)
    start.setFullYear(start.getFullYear() - 1)
    return { startDate: formatDate(start), endDate, timeUnit: 'month' } as const
  }

  return { startDate: '2016-01-01', endDate, timeUnit: 'month' } as const
}

function encodePayload(value: unknown) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function SegmentControl({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (nextValue: string) => void
  options: [string, string][]
}) {
  return (
    <div className="inline-flex flex-wrap rounded-2xl bg-gray-100 p-1">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue || 'all'}
          type="button"
          onClick={() => onChange(optionValue)}
          className={[
            'rounded-2xl px-3 py-2 text-xs font-medium transition-colors',
            value === optionValue ? 'bg-white text-[#002D74] shadow-sm' : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[120px_1fr] lg:items-start">
      <div className="pt-2 text-sm font-medium text-gray-700">{label}</div>
      <div>{children}</div>
    </div>
  )
}

export default function DatalabForm() {
  const router = useRouter()
  const [groups, setGroups] = useState<TopicGroup[]>([{ id: 'group-1', groupName: '', keywords: '' }])
  const [periodType, setPeriodType] = useState<PeriodType>('1y')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [device, setDevice] = useState<DeviceType>('')
  const [gender, setGender] = useState<GenderType>('')
  const [ageGroup, setAgeGroup] = useState<AgeType>('all')

  const customRangeValid = periodType !== 'custom' || Boolean(customStart && customEnd && customStart <= customEnd)
  const validGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          groupName: group.groupName.trim(),
          keywords: group.keywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean)
            .slice(0, 20),
        }))
        .filter((group) => group.groupName && group.keywords.length > 0),
    [groups],
  )
  const canSubmit = validGroups.length > 0 && customRangeValid

  function addGroup() {
    if (groups.length >= 10) return
    setGroups((current) => [...current, { id: `group-${Date.now()}`, groupName: '', keywords: '' }])
  }

  function removeGroup(id: string) {
    setGroups((current) => current.filter((group) => group.id !== id))
  }

  function updateGroup(id: string, field: keyof Pick<TopicGroup, 'groupName' | 'keywords'>, value: string) {
    const nextValue = field === 'keywords'
      ? value
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean)
          .slice(0, 20)
          .join(', ')
      : value

    setGroups((current) =>
      current.map((group) => (group.id === id ? { ...group, [field]: nextValue } : group)),
    )
  }

  function keywordCount(value: string) {
    return value
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean).length
  }

  function handleSubmit() {
    if (!canSubmit) return

    const { startDate, endDate, timeUnit } = buildDateRange(periodType, customStart, customEnd)
    const payload = {
      groups: validGroups,
      startDate,
      endDate,
      timeUnit,
      device,
      gender,
      ages: AGE_MAP[ageGroup],
      periodLabel: PERIOD_LABEL[periodType],
      deviceLabel: device === 'pc' ? 'PC' : device === 'mo' ? '모바일' : '전체',
      genderLabel: gender === 'm' ? '남성' : gender === 'f' ? '여성' : '전체',
      ageLabel:
        ageGroup === 'all'
          ? '전체'
          : ageGroup === '1020'
            ? '10~20대'
            : ageGroup === '2030'
              ? '20~30대'
              : ageGroup === '3040'
                ? '30~40대'
                : ageGroup === '4050'
                  ? '40~50대'
                  : '60대 이상',
    }

    router.push(`/blueberry/datalab?q=${encodePayload(payload)}`)
  }

  return (
    <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#002D74]/8 text-[#002D74]">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Naver DataLab 비교 분석</h2>
              <p className="text-sm text-gray-500">주제 그룹별 검색 추이를 기간, 디바이스, 성별, 연령 조건과 함께 비교합니다.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <FilterRow label="주제 그룹">
          <div className="space-y-3">
            {groups.map((group, index) => (
              <div key={group.id} className="rounded-3xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">그룹 {index + 1}</p>
                  {groups.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                      삭제
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                  <input
                    value={group.groupName}
                    onChange={(event) => updateGroup(group.id, 'groupName', event.target.value)}
                    placeholder="예: 볼뉴머"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#002D74] focus:ring-4 focus:ring-[#002D74]/8"
                  />

                  <div className="relative">
                    <input
                      value={group.keywords}
                      onChange={(event) => updateGroup(group.id, 'keywords', event.target.value)}
                      placeholder="쉼표로 구분해 검색어를 입력하세요. 예: 볼뉴머, 볼뉴머 가격, 볼뉴머 후기"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-16 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#002D74] focus:ring-4 focus:ring-[#002D74]/8"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-400">
                      {keywordCount(group.keywords)}/20
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {groups.length < 10 ? (
              <button
                type="button"
                onClick={addGroup}
                className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-[#002D74] hover:text-[#002D74]"
              >
                <Plus className="h-4 w-4" />
                그룹 추가
              </button>
            ) : null}
          </div>
        </FilterRow>

        <FilterRow label="분석 기간">
          <div className="space-y-3">
            <SegmentControl
              value={periodType}
              onChange={(nextValue) => setPeriodType(nextValue as PeriodType)}
              options={[
                ['1m', '1개월'],
                ['3m', '3개월'],
                ['1y', '1년'],
                ['all', '전체'],
                ['custom', '직접 입력'],
              ]}
            />
            {periodType === 'custom' ? (
              <div className="max-w-sm">
                <DateRangePickerInput
                  from={customStart}
                  to={customEnd}
                  onChange={({ from, to }) => {
                    setCustomStart(from)
                    setCustomEnd(to)
                  }}
                  placeholder="직접 기간 선택"
                />
              </div>
            ) : null}
            {!customRangeValid ? (
              <p className="text-xs text-rose-600">사용자 지정 기간의 시작일과 종료일을 다시 확인해 주세요.</p>
            ) : null}
          </div>
        </FilterRow>

        <FilterRow label="디바이스">
          <SegmentControl
            value={device}
            onChange={(nextValue) => setDevice(nextValue as DeviceType)}
            options={[
              ['', '전체'],
              ['pc', 'PC'],
              ['mo', '모바일'],
            ]}
          />
        </FilterRow>

        <FilterRow label="성별">
          <SegmentControl
            value={gender}
            onChange={(nextValue) => setGender(nextValue as GenderType)}
            options={[
              ['', '전체'],
              ['m', '남성'],
              ['f', '여성'],
            ]}
          />
        </FilterRow>

        <FilterRow label="연령대">
          <SegmentControl
            value={ageGroup}
            onChange={(nextValue) => setAgeGroup(nextValue as AgeType)}
            options={[
              ['all', '전체'],
              ['1020', '10~20대'],
              ['2030', '20~30대'],
              ['3040', '30~40대'],
              ['4050', '40~50대'],
              ['60plus', '60대 이상'],
            ]}
          />
        </FilterRow>

        <div className="flex flex-col gap-3 rounded-3xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#002D74] shadow-sm">
              <Calendar className="h-4 w-4" />
            </span>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">최대 10개 그룹, 그룹당 최대 20개 키워드까지 지원합니다.</p>
              <p className="mt-1">결과 페이지에서 추이 차트와 CSV 다운로드를 바로 확인할 수 있습니다.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-2xl bg-[#002D74] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A4AA8] disabled:cursor-not-allowed disabled:bg-[#9FB5DD]"
          >
            DataLab 분석 실행
          </button>
        </div>
      </div>
    </section>
  )
}
