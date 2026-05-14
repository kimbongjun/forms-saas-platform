'use client'

import { useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Competitor, Tier } from '../_data/competitors'

const EVENT_ICONS: Record<string, string> = {
  Launch: '🚀',
  MA: '🤝',
  Partnership: '🤝',
  Clinical: '🔬',
  Award: '🏆',
  Other: '📌',
}

interface Props {
  competitor: Competitor
  tierColors: Record<Tier, string>
  onClose: () => void
}

export default function CompetitorModal({ competitor: c, tierColors, onClose }: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const recentEvents = [...c.events]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  const latestSource = c.financials.at(-1)?.source ?? ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`flex items-start justify-between p-6 pb-4 ${c.is_classys ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{c.hq_flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{c.company_name}</h2>
                {c.company_name_ko && (
                  <span className="text-sm text-gray-400">{c.company_name_ko}</span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tierColors[c.tier]}`}>
                  {c.tier}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{c.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* 진출시장 + 카테고리 / 매출 차트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽: 시장·카테고리 */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">진출 시장</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.markets.map((m) => (
                    <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">기기 카테고리</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.device_categories.map((cat) => (
                    <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">포지셔닝</p>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>가격 점수: {c.positioning.price_score}/10</p>
                  <p>기술 점수: {c.positioning.tech_score}/10</p>
                  <p>추정 매출: <span className="font-semibold">${c.positioning.revenue_m}M</span></p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 매출 추이 차트 */}
            {c.financials.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">매출 추이 (USD M)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={c.financials} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`$${val}M`, '매출']}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue_usd_m"
                      stroke={c.color}
                      strokeWidth={2}
                      dot={{ r: 3, fill: c.color }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-1">출처: {latestSource}</p>
              </div>
            )}
          </div>

          {/* 제품 목록 */}
          {c.products.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-3">주요 제품</p>
              <div className="space-y-2">
                {c.products.map((p) => (
                  <div key={p.product_name} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{p.product_name}</span>
                        <span className="text-xs text-gray-400">{p.category}</span>
                        <span className="text-xs text-gray-400">{p.launch_year}</span>
                      </div>
                      {p.specs.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{p.specs.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {p.certifications.map((cert) => (
                        <span key={cert} className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 주요 이벤트 */}
          {recentEvents.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-3">주요 이벤트 (최근 {recentEvents.length}건)</p>
              <div className="space-y-2">
                {recentEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{EVENT_ICONS[ev.type] ?? '📌'}</span>
                    <div>
                      <span className="text-xs text-gray-400 mr-2">{ev.date}</span>
                      <span className="text-sm text-gray-700">{ev.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
