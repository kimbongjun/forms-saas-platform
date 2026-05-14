'use client'

import type { Competitor, Region, Tier, DeviceCategory } from '../_data/competitors'

const REGION_LABELS: Record<Region, string> = {
  Korea: '국내 (Korea)', NA: '북미 (North America)', EU: '유럽 (Europe)',
  China: '중국 (China)', SEA: '동남아시아 (SEA)', Others: '기타',
}

const REGION_COLORS: Record<Region, string> = {
  Korea: '#3B82F6', NA: '#F59E0B', EU: '#8B5CF6',
  China: '#EF4444', SEA: '#10B981', Others: '#9CA3AF',
}

const TIER_COLORS: Record<Tier, string> = {
  Tier1: 'bg-violet-100 text-violet-700 border-violet-200',
  Tier2: 'bg-blue-100 text-blue-700 border-blue-200',
  Emerging: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const CAT_COLORS: Record<DeviceCategory, string> = {
  HIFU: 'bg-sky-100 text-sky-700',
  NeedleRF: 'bg-violet-100 text-violet-700',
  RF: 'bg-orange-100 text-orange-700',
  Laser: 'bg-rose-100 text-rose-700',
  Body: 'bg-emerald-100 text-emerald-700',
  Injection: 'bg-pink-100 text-pink-700',
  Combo: 'bg-indigo-100 text-indigo-700',
}

interface Props {
  region: Region
  competitors: Competitor[]
  onClose: () => void
}

export default function MarketDotModal({ region, competitors, onClose }: Props) {
  const inRegion = competitors
    .filter((c) => c.markets.includes(region))
    .sort((a, b) => {
      if (a.is_classys) return -1
      if (b.is_classys) return 1
      return b.positioning.revenue_m - a.positioning.revenue_m
    })

  const color = REGION_COLORS[region]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <div>
              <h3 className="font-bold text-gray-900 text-base">{REGION_LABELS[region]}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{inRegion.length}개사 진출</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Competitor list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {inRegion.map((c) => (
            <div
              key={c.competitor_id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                c.is_classys ? 'bg-blue-50/60' : 'hover:bg-gray-50'
              }`}
              style={{ borderLeft: `3px solid ${c.color}` }}
            >
              <span className="text-xl leading-none shrink-0 mt-0.5">{c.hq_flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-sm ${c.is_classys ? 'text-blue-700' : 'text-gray-900'}`}>
                    {c.company_name}
                  </span>
                  {c.company_name_ko && (
                    <span className="text-xs text-gray-400">{c.company_name_ko}</span>
                  )}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${TIER_COLORS[c.tier]}`}>
                    {c.tier}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.device_categories.map((cat) => (
                    <span
                      key={cat}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${CAT_COLORS[cat]}`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 mt-0.5">
                <span className={`text-sm font-bold ${c.is_classys ? 'text-blue-600' : 'text-gray-700'}`}>
                  ${c.positioning.revenue_m}M
                </span>
              </div>
            </div>
          ))}

          {inRegion.length === 0 && (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              이 지역 진출 경쟁사 없음
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            총 매출: ${inRegion.reduce((s, c) => s + c.positioning.revenue_m, 0).toLocaleString()}M (합산 추정)
          </p>
        </div>
      </div>
    </div>
  )
}
