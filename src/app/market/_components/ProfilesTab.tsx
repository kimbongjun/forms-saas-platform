'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Competitor, Tier } from '../_data/competitors'

const CAT_COLORS: Record<string, string> = {
  HIFU: 'bg-sky-100 text-sky-700',
  NeedleRF: 'bg-violet-100 text-violet-700',
  RF: 'bg-orange-100 text-orange-700',
  Laser: 'bg-rose-100 text-rose-700',
  Body: 'bg-emerald-100 text-emerald-700',
  Injection: 'bg-pink-100 text-pink-700',
  Combo: 'bg-indigo-100 text-indigo-700',
}

const TIER_COLORS: Record<Tier, string> = {
  Tier1: 'bg-violet-100 text-violet-700 border-violet-200',
  Tier2: 'bg-blue-100 text-blue-700 border-blue-200',
  Emerging: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const CERT_CLS: Record<string, string> = {
  FDA: 'bg-emerald-100 text-emerald-700',
  CE: 'bg-blue-100 text-blue-700',
  KFDA: 'bg-amber-100 text-amber-700',
}

const EVENT_META: Record<string, { label: string; cls: string }> = {
  Launch: { label: 'Launch', cls: 'bg-blue-100 text-blue-700' },
  MA: { label: 'M&A', cls: 'bg-violet-100 text-violet-700' },
  Partnership: { label: 'Partnership', cls: 'bg-emerald-100 text-emerald-700' },
  Clinical: { label: 'Clinical', cls: 'bg-amber-100 text-amber-700' },
  Award: { label: 'Award', cls: 'bg-orange-100 text-orange-700' },
  Other: { label: 'Other', cls: 'bg-gray-100 text-gray-600' },
}

interface Props {
  competitors: Competitor[]
  matchSet: Set<string>
}

export default function ProfilesTab({ competitors, matchSet }: Props) {
  const sorted = [...competitors].sort((a, b) => {
    if (a.is_classys) return -1
    if (b.is_classys) return 1
    const order: Record<Tier, number> = { Tier1: 0, Tier2: 1, Emerging: 2 }
    return order[a.tier] - order[b.tier]
  })

  const [selectedId, setSelectedId] = useState<string>(sorted[0]?.competitor_id ?? '')
  const selected = competitors.find((c) => c.competitor_id === selectedId) ?? sorted[0]

  return (
    <div className="flex gap-6" style={{ minHeight: 600 }}>
      {/* ── 사이드바 ──────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">경쟁사 목록</p>
          <p className="text-[11px] text-gray-400 mt-0.5">전체 {sorted.length}개사</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {sorted.map((c) => {
            const active = c.competitor_id === selectedId
            const matched = matchSet.has(c.competitor_id)
            return (
              <button
                key={c.competitor_id}
                onClick={() => setSelectedId(c.competitor_id)}
                style={{
                  borderLeftColor: active ? c.color : 'transparent',
                  borderLeftWidth: 3,
                }}
                className={[
                  'w-full flex items-center gap-3 px-3 py-3 text-left transition-colors',
                  active ? 'bg-gray-50' : 'hover:bg-gray-50',
                  !matched ? 'opacity-40' : '',
                ].join(' ')}
              >
                <span className="text-base leading-none">{c.hq_flag}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      active ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {c.company_name}
                    {c.is_classys && (
                      <span className="ml-1.5 text-[10px] font-semibold text-blue-500">My</span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {c.tier} · ${c.positioning.revenue_m}M
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ────────────────────────────────────────────────────── */}
      {selected ? (
        <ProfileDetail key={selected.competitor_id} competitor={selected} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-400">경쟁사를 선택하세요</p>
        </div>
      )}
    </div>
  )
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string
  score: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold text-gray-700">
          {score}
          <span className="font-normal text-gray-400">/10</span>
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score * 10}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── ProfileDetail ────────────────────────────────────────────────────────────

function ProfileDetail({ competitor: c }: { competitor: Competitor }) {
  const latestRevenue = c.financials.at(-1)?.revenue_usd_m ?? c.positioning.revenue_m
  const sortedEvents = [...c.events].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex-1 min-w-0 space-y-5 overflow-y-auto pb-4">
      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: c.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: c.color + '1A' }}
              >
                {c.hq_flag}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{c.company_name}</h2>
                  {c.company_name_ko && (
                    <span className="text-sm text-gray-400">{c.company_name_ko}</span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TIER_COLORS[c.tier]}`}
                  >
                    {c.tier}
                  </span>
                  {c.is_classys && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      My Company
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-gray-500 max-w-xl leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right bg-gray-50 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold text-gray-900">${latestRevenue}M</p>
              <p className="text-xs text-gray-400 mt-0.5">연매출 추정 (USD)</p>
              <p className="text-[11px] text-gray-300 mt-0.5">{c.confidence.level}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-5 flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                진출 시장
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.markets.map((m) => (
                  <span
                    key={m}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                기기 카테고리
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.device_categories.map((cat) => (
                  <span
                    key={cat}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      CAT_COLORS[cat] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Score bars */}
          <div className="mt-5 grid grid-cols-2 gap-4 max-w-sm">
            <ScoreBar label="가격 경쟁력" score={c.positioning.price_score} color={c.color} />
            <ScoreBar label="기술 수준" score={c.positioning.tech_score} color={c.color} />
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      {c.financials.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">매출 추이</p>
            <span className="text-xs text-gray-400">
              USD M · {c.financials.at(-1)?.source ?? '추정'}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={c.financials} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${c.competitor_id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val) => [`$${val}M`, '매출']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="revenue_usd_m"
                stroke={c.color}
                strokeWidth={2.5}
                fill={`url(#g-${c.competitor_id})`}
                dot={{ r: 3.5, fill: c.color, strokeWidth: 0 }}
                activeDot={{ r: 5.5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Products */}
      {c.products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            제품 라인업{' '}
            <span className="font-normal text-gray-400 ml-1">{c.products.length}개</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.products.map((p) => (
              <div
                key={p.product_name}
                className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{p.product_name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                          CAT_COLORS[p.category] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.category}
                      </span>
                      {p.launch_year > 0 && (
                        <span className="text-[11px] text-gray-400">{p.launch_year}</span>
                      )}
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded border ${
                          p.price_tier === 'Premium'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : p.price_tier === 'Mid'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}
                      >
                        {p.price_tier}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {p.certifications.map((cert) => (
                      <span
                        key={cert}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          CERT_CLS[cert] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {p.specs.energy_type && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{p.specs.energy_type}</p>
                )}

                {p.specs.indications && p.specs.indications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.specs.indications.slice(0, 3).map((ind) => (
                      <span
                        key={ind}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100"
                      >
                        {ind}
                      </span>
                    ))}
                    {p.specs.indications.length > 3 && (
                      <span className="text-[10px] text-gray-400">
                        +{p.specs.indications.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      {sortedEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">
            활동 이력{' '}
            <span className="font-normal text-gray-400 ml-1">{sortedEvents.length}건</span>
          </p>
          <div className="relative pl-4">
            <div className="absolute left-[5px] top-1 bottom-1 w-px bg-gray-100" />
            <div className="space-y-5">
              {sortedEvents.map((ev, i) => {
                const meta = EVENT_META[ev.type] ?? EVENT_META.Other
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1 ring-2 ring-white -ml-4"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs text-gray-400">{ev.date}</span>
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{ev.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
