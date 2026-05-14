'use client'

import { useState, useMemo } from 'react'
import type { Competitor, EventType } from '../_data/competitors'
import { INDUSTRY_EVENTS, type IndustryEvent } from '../_data/industry-events'
import type { PressResult, PressItemType } from '@/app/api/market/press/route'

// ─── 현재 날짜 기준 (하드코딩 — 빌드 타임에 고정) ────────────────────────────
const NOW_YEAR = 2026
const NOW_MONTH = 5

// ─── 이벤트 유형 메타 ─────────────────────────────────────────────────────────

const EVENT_TYPE_META: Record<EventType, { label: string; cls: string; dot: string }> = {
  Launch:      { label: '제품 출시', cls: 'bg-blue-100 text-blue-700',    dot: '#3B82F6' },
  MA:          { label: 'M&A',      cls: 'bg-violet-100 text-violet-700', dot: '#8B5CF6' },
  Partnership: { label: '파트너십', cls: 'bg-emerald-100 text-emerald-700', dot: '#10B981' },
  Clinical:    { label: '임상',     cls: 'bg-amber-100 text-amber-700',   dot: '#F59E0B' },
  Award:       { label: '수상',     cls: 'bg-orange-100 text-orange-700', dot: '#F97316' },
  Other:       { label: '기타',     cls: 'bg-gray-100 text-gray-600',     dot: '#9CA3AF' },
}

const PRESS_TYPE_META: Record<PressItemType, { label: string; cls: string }> = {
  launch:      { label: '제품 출시', cls: 'bg-blue-100 text-blue-700' },
  ma:          { label: 'M&A',      cls: 'bg-violet-100 text-violet-700' },
  clinical:    { label: '임상',     cls: 'bg-amber-100 text-amber-700' },
  financial:   { label: '재무',     cls: 'bg-green-100 text-green-700' },
  partnership: { label: '파트너십', cls: 'bg-emerald-100 text-emerald-700' },
  award:       { label: '수상',     cls: 'bg-orange-100 text-orange-700' },
  other:       { label: '기타',     cls: 'bg-gray-100 text-gray-600' },
}

const CAT_META = {
  aesthetics:  { label: '에스테틱',  cls: 'bg-pink-100 text-pink-700' },
  dermatology: { label: '피부과학',  cls: 'bg-blue-100 text-blue-700' },
  laser:       { label: '레이저',    cls: 'bg-red-100 text-red-700' },
  mixed:       { label: '의료기기',  cls: 'bg-gray-100 text-gray-600' },
} as const

const REGION_BORDER: Record<IndustryEvent['region'], string> = {
  Korea: 'border-blue-300',
  NA: 'border-amber-300',
  EU: 'border-violet-300',
  SEA: 'border-emerald-300',
  Others: 'border-gray-300',
}

const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

const ALL_TYPES: EventType[] = ['Launch', 'MA', 'Partnership', 'Clinical', 'Award', 'Other']

// ─── 공통 헬퍼 ───────────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

function getEventStatus(year: number, month: number): 'past' | 'current' | 'upcoming' {
  if (year < NOW_YEAR || (year === NOW_YEAR && month < NOW_MONTH)) return 'past'
  if (year === NOW_YEAR && month === NOW_MONTH) return 'current'
  return 'upcoming'
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  competitors: Competitor[]
  matchSet: Set<string>
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function EventsTab({ competitors, matchSet }: Props) {
  return (
    <div className="space-y-10">
      <IndustryCalendar />
      <CompanyTimeline competitors={competitors} />
      <PressReleaseFeed competitors={competitors} />
    </div>
  )
}

// ─── Section 1: 업계 이벤트 캘린더 ───────────────────────────────────────────

function IndustryCalendar() {
  const [year, setYear] = useState(2026)

  const events = useMemo(
    () => INDUSTRY_EVENTS.filter((e) => e.year === year).sort((a, b) => a.month - b.month),
    [year],
  )

  const upcomingCount = events.filter((e) => getEventStatus(e.year, e.month) !== 'past').length

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <SectionHeading
          title="업계 이벤트 캘린더"
          sub={year === NOW_YEAR ? `${upcomingCount}개 예정·진행 중` : undefined}
        />
        <div className="flex gap-1">
          {[2025, 2026].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                year === y
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {events.map((ev) => {
          const status = getEventStatus(ev.year, ev.month)
          const El = ev.url ? 'a' : 'div'
          return (
            <El
              key={ev.id}
              {...(ev.url ? { href: ev.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={[
                'relative bg-white rounded-xl border-2 p-3.5 transition-all duration-200 select-none',
                status === 'past' && 'opacity-45 border-gray-100 grayscale-[30%]',
                status === 'current' && 'border-blue-400 shadow-lg shadow-blue-100/60',
                status === 'upcoming' && `${REGION_BORDER[ev.region]} hover:shadow-md hover:-translate-y-0.5 cursor-pointer`,
              ].filter(Boolean).join(' ')}
            >
              {status === 'current' && (
                <span className="absolute -top-2.5 left-3 text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  진행중
                </span>
              )}
              {status === 'upcoming' && (
                <span className="absolute -top-2.5 left-3 text-[9px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  예정
                </span>
              )}

              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-xl leading-none">{ev.country_flag}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${CAT_META[ev.category].cls}`}>
                  {CAT_META[ev.category].label}
                </span>
              </div>

              <p className="font-bold text-xs text-gray-900 leading-tight mb-1">{ev.name}</p>
              <p className="text-[10px] text-gray-400 truncate mb-2.5" title={ev.full_name}>
                {ev.full_name}
              </p>

              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-gray-500 truncate">{ev.location}</span>
                <span className="text-[10px] font-semibold text-gray-600 shrink-0">
                  {MONTH_KO[ev.month - 1]}
                </span>
              </div>

              {ev.date_label && (
                <p className="text-[9px] text-gray-300 mt-1">{ev.date_label}</p>
              )}
            </El>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section 2: 경쟁사 활동 타임라인 ─────────────────────────────────────────

interface AggEvent {
  date: string
  type: EventType
  description: string
  company_id: string
  company_name: string
  company_flag: string
  company_color: string
  is_classys: boolean
}

function CompanyTimeline({ competitors }: { competitors: Competitor[] }) {
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set())

  const allEvents: AggEvent[] = useMemo(() => {
    const items: AggEvent[] = []
    for (const c of competitors) {
      for (const ev of c.events) {
        items.push({
          date: ev.date,
          type: ev.type,
          description: ev.description,
          company_id: c.competitor_id,
          company_name: c.company_name,
          company_flag: c.hq_flag,
          company_color: c.color,
          is_classys: c.is_classys === true,
        })
      }
    }
    return items.sort((a, b) => b.date.localeCompare(a.date))
  }, [competitors])

  const filtered = useMemo(
    () =>
      allEvents.filter((ev) => {
        const compOk = selectedCompanies.size === 0 || selectedCompanies.has(ev.company_id)
        const typeOk = selectedTypes.size === 0 || selectedTypes.has(ev.type)
        return compOk && typeOk
      }),
    [allEvents, selectedCompanies, selectedTypes],
  )

  const hasFilter = selectedCompanies.size > 0 || selectedTypes.size > 0

  function toggleCompany(id: string) {
    setSelectedCompanies((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function toggleType(type: EventType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type); else next.add(type)
      return next
    })
  }

  return (
    <section>
      <SectionHeading title="경쟁사 활동 타임라인" sub={`${filtered.length}개 이벤트`} />

      {/* 필터 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        {/* 이벤트 유형 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 w-10 shrink-0">유형</span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TYPES.map((type) => {
              const meta = EVENT_TYPE_META[type]
              const active = selectedTypes.has(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    active ? `${meta.cls} border-current` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 회사 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 w-10 shrink-0">회사</span>
          <div className="flex flex-wrap gap-1.5">
            {competitors.map((c) => {
              const active = selectedCompanies.has(c.competitor_id)
              return (
                <button
                  key={c.competitor_id}
                  onClick={() => toggleCompany(c.competitor_id)}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                    active ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={active ? { backgroundColor: c.color } : {}}
                >
                  <span>{c.hq_flag}</span>
                  <span className="max-w-[72px] truncate">{c.company_name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {hasFilter && (
          <button
            onClick={() => { setSelectedCompanies(new Set()); setSelectedTypes(new Set()) }}
            className="text-xs text-blue-600 hover:underline"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 타임라인 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            선택한 조건에 해당하는 이벤트가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((ev, i) => {
              const meta = EVENT_TYPE_META[ev.type]
              const [y, m] = ev.date.split('-')
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                    ev.is_classys ? 'bg-blue-50/40' : 'hover:bg-gray-50/60'
                  }`}
                >
                  {/* 날짜 */}
                  <div className="shrink-0 w-14 pt-0.5">
                    <p className="text-[11px] font-mono text-gray-800 leading-tight">{y}</p>
                    <p className="text-[10px] text-gray-400">{MONTH_KO[Number(m) - 1]}</p>
                  </div>

                  {/* 타임라인 점 */}
                  <div className="flex flex-col items-center shrink-0 pt-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
                    {i < filtered.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 mt-1" style={{ minHeight: 16 }} />
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: ev.company_color }}
                      >
                        {ev.company_flag} {ev.company_name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{ev.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Section 3: 보도자료 AI 피드 ──────────────────────────────────────────────

function PressReleaseFeed({ competitors }: { competitors: Competitor[] }) {
  const [selectedId, setSelectedId] = useState<string>(competitors[0]?.competitor_id ?? '')
  const [pressMap, setPressMap] = useState<Map<string, PressResult | 'loading' | 'error'>>(new Map())

  const selected = competitors.find((c) => c.competitor_id === selectedId)
  const status = pressMap.get(selectedId)
  const isLoading = status === 'loading'
  const isError = status === 'error'
  const result = status && status !== 'loading' && status !== 'error' ? status : null

  async function fetchPress() {
    if (!selected || isLoading) return
    setPressMap((prev) => new Map(prev).set(selected.competitor_id, 'loading'))
    try {
      const res = await fetch('/api/market/press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitor_id: selected.competitor_id, company_name: selected.company_name }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as PressResult
      setPressMap((prev) => new Map(prev).set(selected.competitor_id, data))
    } catch {
      setPressMap((prev) => new Map(prev).set(selected.competitor_id, 'error'))
    }
  }

  return (
    <section>
      <SectionHeading title="보도자료 AI 피드" sub="Serper 검색 + Claude 분석 · 경쟁사 선택 후 PR 가져오기" />

      {/* 컴퍼니 셀렉터 + 버튼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {competitors.map((c) => {
              const active = selectedId === c.competitor_id
              const fetched =
                pressMap.has(c.competitor_id) &&
                pressMap.get(c.competitor_id) !== 'loading' &&
                pressMap.get(c.competitor_id) !== 'error'
              return (
                <button
                  key={c.competitor_id}
                  onClick={() => setSelectedId(c.competitor_id)}
                  className={[
                    'relative flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all',
                    active ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                  ].join(' ')}
                  style={active ? { backgroundColor: c.color } : {}}
                >
                  <span>{c.hq_flag}</span>
                  <span className="max-w-[80px] truncate">{c.company_name}</span>
                  {fetched && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="데이터 로드됨" />
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={fetchPress}
            disabled={isLoading || !selected}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {isLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                검색 중…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                PR 가져오기
              </>
            )}
          </button>
        </div>
      </div>

      {/* 에러 */}
      {isError && (
        <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>검색 실패. API 키를 확인하거나 잠시 후 재시도해 주세요.</span>
          <button onClick={fetchPress} className="ml-auto text-xs underline shrink-0">재시도</button>
        </div>
      )}

      {/* 결과 카드 그리드 */}
      {result && (
        <div>
          <p className="text-xs text-gray-400 mb-3">
            {selected?.hq_flag} {selected?.company_name} ·{' '}
            {result.items.length}개 항목 ·{' '}
            {new Date(result.fetched_at).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 기준
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.items.map((item, i) => {
              const typeMeta = PRESS_TYPE_META[item.type] ?? PRESS_TYPE_META.other
              return (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${typeMeta.cls}`}>
                      {typeMeta.label}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">{item.date}</span>
                  </div>

                  <p className="text-xs font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {item.title}
                  </p>

                  <p className="text-[11px] text-gray-500 leading-relaxed flex-1 line-clamp-3">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
                    <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-[10px] text-gray-400 truncate">{item.source}</span>
                    <svg className="w-3 h-3 text-gray-300 ml-auto shrink-0 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!result && !isLoading && !isError && selected && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
          </svg>
          <p className="text-sm font-medium text-gray-400 mb-1">
            {selected.hq_flag} {selected.company_name} 보도자료 검색
          </p>
          <p className="text-xs text-gray-300">위의 &ldquo;PR 가져오기&rdquo; 버튼을 눌러 Serper + Claude AI로 분석합니다</p>
        </div>
      )}
    </section>
  )
}
