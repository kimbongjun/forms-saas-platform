'use client'

import type { Competitor, DeviceCategory, Region, Tier, DataConfidence } from '../_data/competitors'
import type { EnrichResult } from '@/app/api/market/enrich/route'

const CAT_COLORS: Record<DeviceCategory, string> = {
  HIFU: 'bg-sky-100 text-sky-700',
  NeedleRF: 'bg-violet-100 text-violet-700',
  RF: 'bg-orange-100 text-orange-700',
  Laser: 'bg-rose-100 text-rose-700',
  Body: 'bg-emerald-100 text-emerald-700',
  Injection: 'bg-pink-100 text-pink-700',
  Combo: 'bg-indigo-100 text-indigo-700',
}

const CAT_LABEL: Record<DeviceCategory, string> = {
  HIFU: 'HIFU', NeedleRF: 'NeedleRF', RF: 'RF', Laser: 'Laser',
  Body: 'Body', Injection: 'Inj.', Combo: 'Combo',
}

const REGION_CHIP: Record<Region, { cls: string; label: string }> = {
  Korea: { cls: 'bg-blue-50 text-blue-600 border-blue-200', label: 'KR' },
  NA: { cls: 'bg-amber-50 text-amber-600 border-amber-200', label: 'NA' },
  EU: { cls: 'bg-violet-50 text-violet-600 border-violet-200', label: 'EU' },
  China: { cls: 'bg-red-50 text-red-600 border-red-200', label: 'CN' },
  SEA: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'SEA' },
  Others: { cls: 'bg-gray-50 text-gray-500 border-gray-200', label: '기타' },
}

interface Props {
  competitor: Competitor
  matched: boolean
  tierColors: Record<Tier, string>
  confidenceBadge: Record<DataConfidence['level'], { label: string; cls: string }>
  enrichStatus?: EnrichResult | 'loading' | 'error' | undefined
  onEnrich: () => void
  onClick: () => void
  maxRevenue: number
}

export default function CompetitorCard({
  competitor: c,
  matched,
  tierColors,
  confidenceBadge,
  enrichStatus,
  onEnrich,
  onClick,
  maxRevenue,
}: Props) {
  const isClassys = c.is_classys === true
  const isLoading = enrichStatus === 'loading'
  const isError = enrichStatus === 'error'
  const isEnriched = enrichStatus && enrichStatus !== 'loading' && enrichStatus !== 'error'
  const badge = confidenceBadge[c.confidence.level]
  const revPct = Math.round((c.positioning.revenue_m / maxRevenue) * 100)
  const accentColor = isClassys ? '#3B82F6' : c.color

  return (
    <div
      className={[
        'group relative flex rounded-xl border bg-white overflow-hidden',
        'transition-all duration-200',
        isClassys ? 'border-blue-200' : 'border-gray-200',
        matched
          ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
          : 'opacity-40 pointer-events-none',
      ].join(' ')}
    >
      {/* Left color accent bar */}
      <div className="shrink-0" style={{ width: 4, backgroundColor: accentColor }} />

      {/* Card content */}
      <div className="flex-1 p-4 min-w-0">
        {/* Header: flag + name + tier badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <button
            className="flex items-center gap-2 min-w-0 text-left flex-1"
            onClick={onClick}
          >
            <span className="text-xl leading-none shrink-0">{c.hq_flag}</span>
            <div className="min-w-0">
              <p className={`font-bold text-sm leading-tight truncate ${isClassys ? 'text-blue-700' : 'text-gray-900'}`}>
                {c.company_name}
              </p>
              {c.company_name_ko && (
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{c.company_name_ko}</p>
              )}
            </div>
          </button>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierColors[c.tier]}`}>
            {c.tier}
          </span>
        </div>

        <button className="w-full text-left" onClick={onClick}>
          {/* Category chips */}
          <div className="flex flex-wrap gap-1 mb-2.5">
            {c.device_categories.map((cat) => (
              <span
                key={cat}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${CAT_COLORS[cat]}`}
              >
                {CAT_LABEL[cat]}
              </span>
            ))}
          </div>

          {/* Market region pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {c.markets.slice(0, 5).map((m) => (
              <span
                key={m}
                className={`text-[10px] font-medium px-1.5 py-px rounded border ${REGION_CHIP[m].cls}`}
              >
                {REGION_CHIP[m].label}
              </span>
            ))}
            {c.markets.length > 5 && (
              <span className="text-[10px] text-gray-400 self-center">+{c.markets.length - 5}</span>
            )}
          </div>

          {/* Revenue + bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">매출 추정</span>
              <span className={`text-sm font-bold ${isClassys ? 'text-blue-600' : 'text-gray-800'}`}>
                ${c.positioning.revenue_m}M
                {isClassys && <span className="ml-1 text-xs font-normal text-blue-400">↗</span>}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${revPct}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        </button>

        {/* Footer: confidence badge + enrich button */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.cls}`}>
            {isEnriched ? 'AI 검증됨' : badge.label}
          </span>

          {!isClassys && (
            <button
              onClick={(e) => { e.stopPropagation(); onEnrich() }}
              disabled={isLoading}
              className="text-[11px] text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 disabled:opacity-50"
              title="AI + Serper로 데이터 재검증"
            >
              {isLoading ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : isError ? (
                <span className="text-red-400">재시도</span>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {!isLoading && !isError && <span>검증</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
