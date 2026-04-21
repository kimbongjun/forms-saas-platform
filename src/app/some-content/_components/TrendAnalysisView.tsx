'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Download, Sparkles } from 'lucide-react'
import type { ScKeyword } from '@/types/database'
import type { TrendResult } from '@/app/api/some-content/trend/route'
import type { SentimentResult, SentimentWord } from '@/app/api/some-content/sentiment/route'
import type { InsightsResult } from '@/app/api/some-content/insights/route'

const KeywordMindMap = dynamic(() => import('./KeywordMindMap'), { ssr: false })

// ─────────────────────────────────────────────
// SVG Trend Chart
// ─────────────────────────────────────────────
const VW = 700, VH = 200
const ML = 40, MR = 16, MT = 16, MB = 46
const PW = VW - ML - MR
const PH = VH - MT - MB

function TrendChart({ result }: { result: TrendResult }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { points, metrics } = result
  const n = points.length
  if (n === 0) return null

  const xs = (i: number) => ML + (n > 1 ? (i / (n - 1)) * PW : PW / 2)
  const ys = (v: number) => MT + (1 - Math.max(0, Math.min(100, v)) / 100) * PH

  const coords = points.map((p, i) => ({ x: xs(i), y: ys(p.value), ...p }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const areaPath =
    linePath +
    ` L${coords[n - 1].x.toFixed(1)},${(MT + PH).toFixed(1)} L${coords[0].x.toFixed(1)},${(MT + PH).toFixed(1)} Z`

  const trendColor =
    metrics.trend === 'up' ? '#10B981' :
    metrics.trend === 'down' ? '#EF4444' : '#6B7280'

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || n < 2) return
    const svgX = ((e.clientX - rect.left) / rect.width) * VW
    const idx = Math.round(((svgX - ML) / PW) * (n - 1))
    setHovIdx(Math.max(0, Math.min(n - 1, idx)))
  }

  const hov = hovIdx !== null ? coords[hovIdx] : null

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full select-none cursor-crosshair"
      style={{ height: '180px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovIdx(null)}
    >
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map(t => (
        <g key={t}>
          <line x1={ML} y1={ys(t)} x2={VW - MR} y2={ys(t)} stroke="#F3F4F6" strokeWidth="1" />
          <text x={ML - 4} y={ys(t) + 4} textAnchor="end" fill="#9CA3AF" fontSize="9">{t}</text>
        </g>
      ))}

      <path d={areaPath} fill="url(#trendGrad)" />
      <path d={linePath} fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {hov && (
        <line x1={hov.x} y1={MT} x2={hov.x} y2={MT + PH} stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4 3" />
      )}

      {coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x} cy={c.y}
          r={hovIdx === i ? 5 : 2.5}
          fill={hovIdx === i ? trendColor : 'white'}
          stroke={trendColor}
          strokeWidth="1.5"
          style={{ transition: 'r 0.1s' }}
        />
      ))}

      {coords.map((c, i) => {
        if (n > 9 && i % 2 !== 0 && i !== n - 1) return null
        return (
          <text
            key={i}
            x={c.x} y={VH - 6}
            textAnchor="middle"
            fill={hovIdx === i ? '#374151' : '#9CA3AF'}
            fontSize="9"
            fontWeight={hovIdx === i ? 600 : 400}
          >
            {c.label}
          </text>
        )
      })}

      {hov && (() => {
        const tx = Math.min(hov.x + 8, VW - MR - 98)
        const ty = Math.max(hov.y - 40, MT + 2)
        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={tx} y={ty} width={90} height={30} rx={5} fill="#1F2937" fillOpacity={0.92} />
            <text x={tx + 45} y={ty + 11} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">{hov.label}</text>
            <text x={tx + 45} y={ty + 23} textAnchor="middle" fill="#9CA3AF" fontSize="9">지수 {hov.value}</text>
          </g>
        )
      })()}
    </svg>
  )
}

// ─────────────────────────────────────────────
// Metric card
// ─────────────────────────────────────────────
function MetricCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs font-medium text-gray-500 leading-tight">{label}</p>
      <p className={`mt-0.5 text-xl font-bold leading-tight ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400 leading-tight">{sub}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Word Cloud
// ─────────────────────────────────────────────
function WordCloud({ words, baseColor }: { words: SentimentWord[]; baseColor: string }) {
  if (!words.length) {
    return (
      <p className="py-4 text-center text-xs text-gray-400">게시글 수집 후 분석됩니다</p>
    )
  }
  const maxW = Math.max(1, ...words.map(w => w.weight))
  return (
    <div className="flex min-h-[80px] flex-wrap items-center justify-center gap-1.5 py-2">
      {[...words].sort((a, b) => b.weight - a.weight).map(w => (
        <span
          key={w.word}
          className="cursor-default leading-relaxed"
          style={{
            fontSize: `${9 + Math.round((w.weight / maxW) * 18)}px`,
            color: baseColor,
            opacity: 0.45 + (w.weight / maxW) * 0.55,
            fontWeight: w.weight / maxW > 0.7 ? 700 : w.weight / maxW > 0.4 ? 600 : 500,
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// AI Insights Panel (Groq)
// ─────────────────────────────────────────────
function InsightsPanel({
  keyword, trendData, sentimentData,
}: {
  keyword: string
  trendData: TrendResult | null
  sentimentData: SentimentResult | null
}) {
  const [insights, setInsights] = useState<InsightsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    if (!trendData && !sentimentData) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/some-content/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          metrics: trendData?.metrics,
          sentimentSummary: sentimentData?.summary,
          positive: sentimentData?.positive?.slice(0, 5),
          negative: sentimentData?.negative?.slice(0, 5),
        }),
      })
      if (res.ok) setInsights(await res.json())
      else {
        const d = await res.json() as { error?: string }
        setError(d.error ?? '오류')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [keyword, trendData, sentimentData])

  useEffect(() => { fetch_() }, [fetch_])

  return (
    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <h3 className="text-sm font-bold text-purple-900">AI 종합 인사이트</h3>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">Groq Llama 3.3</span>
        </div>
        {!loading && (trendData || sentimentData) && (
          <button
            onClick={fetch_}
            title="재분석"
            className="rounded-lg p-1 text-gray-400 hover:bg-purple-100 hover:text-purple-600 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
          <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
          Groq 분석 중...
        </div>
      ) : error ? (
        <p className="py-3 text-xs text-gray-400">{error}</p>
      ) : insights ? (
        <div className="space-y-3 text-sm">
          {insights.trend_summary && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">트렌드 요약</p>
              <p className="leading-relaxed text-gray-700">{insights.trend_summary}</p>
            </div>
          )}
          {insights.opportunities?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600">기회 요인</p>
              <ul className="space-y-0.5">
                {insights.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-gray-700">
                    <span className="mt-0.5 shrink-0 text-green-500 text-xs">▸</span>{o}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {insights.risks?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-500">리스크</p>
              <ul className="space-y-0.5">
                {insights.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-gray-700">
                    <span className="mt-0.5 shrink-0 text-red-400 text-xs">▸</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {insights.recommendations?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">추천 액션</p>
              <ul className="space-y-0.5">
                {insights.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-gray-700">
                    <span className="mt-0.5 shrink-0 text-blue-400 text-xs">▸</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-gray-400">
          트렌드 및 감성 데이터 수집 후 분석됩니다
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// CSV export utility
// ─────────────────────────────────────────────
function downloadCSV(filename: string, rows: (string | number)[][]) {
  const bom = '\uFEFF'
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function TrendAnalysisView({ keywords }: { keywords: ScKeyword[] }) {
  const activeKws = keywords.filter(k => k.is_active)
  const [selectedId, setSelectedId] = useState<string>(activeKws[0]?.id ?? '')
  const [trendData, setTrendData] = useState<TrendResult | null>(null)
  const [sentimentData, setSentimentData] = useState<SentimentResult | null>(null)
  const [trendLoading, setTrendLoading] = useState(false)
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const [trendError, setTrendError] = useState<string | null>(null)

  const selected = activeKws.find(k => k.id === selectedId) ?? activeKws[0]
  const selId = selected?.id ?? ''
  const selKw = selected?.keyword ?? ''

  useEffect(() => {
    if (!selKw) return
    setTrendData(null)
    setTrendError(null)
    setTrendLoading(true)
    fetch(`/api/some-content/trend?keyword=${encodeURIComponent(selKw)}`)
      .then(r => r.ok ? r.json() : r.json().then((d: { error?: string }) => Promise.reject(d.error ?? '오류')))
      .then((d: TrendResult) => setTrendData(d))
      .catch((e: unknown) => setTrendError(String(e)))
      .finally(() => setTrendLoading(false))
  }, [selId, selKw])

  useEffect(() => {
    if (!selId || !selKw) return
    setSentimentData(null)
    setSentimentLoading(true)
    fetch(`/api/some-content/sentiment?keyword_id=${selId}&keyword=${encodeURIComponent(selKw)}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: SentimentResult | null) => setSentimentData(d))
      .finally(() => setSentimentLoading(false))
  }, [selId, selKw])

  const handleExportCSV = () => {
    const date = new Date().toISOString().slice(0, 10)
    const rows: (string | number)[][] = []

    if (trendData) {
      rows.push(['[검색량 트렌드]', '', ''])
      rows.push(['월', '레이블', '검색지수'])
      for (const p of trendData.points) rows.push([p.month, p.label, p.value])
      if (trendData.metrics) {
        const m = trendData.metrics
        rows.push(['', '', ''])
        rows.push(['[트렌드 지표]', '', ''])
        rows.push(['트렌드 방향', m.trend === 'up' ? '상승세' : m.trend === 'down' ? '하락세' : '보합세', ''])
        rows.push(['성장률', `${m.growthRate}%`, '최근 vs 직전 3개월'])
        rows.push(['변동성', `${m.volatility}%`, '최고-최저 진폭'])
        rows.push(['전체 평균', m.avg, '12개월'])
        rows.push(['최근 3개월 평균', m.recent3Avg, ''])
        rows.push(['최고월', m.max, m.maxMonth])
        rows.push(['최저월', m.min, m.minMonth])
      }
    }

    if (sentimentData) {
      rows.push(['', '', ''])
      rows.push(['[감성 분석]', '', ''])
      rows.push(['감성', '키워드', '가중치(1-10)'])
      for (const w of sentimentData.positive)  rows.push(['긍정', w.word, w.weight])
      for (const w of sentimentData.negative)  rows.push(['부정', w.word, w.weight])
      for (const w of sentimentData.neutral)   rows.push(['중립', w.word, w.weight])
      if (sentimentData.summary) {
        rows.push(['', '', ''])
        rows.push(['[AI 감성 요약]', sentimentData.summary, ''])
      }
    }

    if (rows.length === 0) return
    downloadCSV(`썸콘텐츠_${selKw}_${date}.csv`, rows)
  }

  if (activeKws.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20">
        <p className="text-sm text-gray-400">설정 탭에서 키워드를 추가하세요.</p>
      </div>
    )
  }

  const m = trendData?.metrics

  return (
    <div className="space-y-4">

      {/* Keyword selector + CSV export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {activeKws.map(k => (
            <button
              key={k.id}
              onClick={() => setSelectedId(k.id)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                (selectedId === k.id || (!selectedId && k === activeKws[0]))
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {k.keyword}
            </button>
          ))}
        </div>
        {(trendData || sentimentData) && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            CSV 다운로드
          </button>
        )}
      </div>

      {/* ── 2-column main layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Left column: Mindmap */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">연관어 마인드맵</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">Naver 검색광고 API</span>
          </div>
          <div
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            style={{ minHeight: '580px' }}
          >
            {selected && <KeywordMindMap centerKeyword={selected.keyword} />}
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            노드 클릭 시 해당 키워드로 탐색 · 검색량 기준 노드 크기 결정
          </p>
        </div>

        {/* Right column: Trend + Metrics + Sentiment + Insights */}
        <div className="flex flex-col gap-4 lg:col-span-2">

          {/* Trend chart */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">검색량 트렌드</h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">DataLab · 12개월</span>
              </div>
              {m && (
                <div className={[
                  'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  m.trend === 'up'   ? 'bg-green-100 text-green-700' :
                  m.trend === 'down' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600',
                ].join(' ')}>
                  {m.trend === 'up'   ? <TrendingUp className="h-3.5 w-3.5" /> :
                   m.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5" /> :
                   <Minus className="h-3.5 w-3.5" />}
                  {m.trend === 'up' ? '상승세' : m.trend === 'down' ? '하락세' : '보합세'}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              {trendLoading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-400">DataLab 조회 중...</span>
                </div>
              ) : trendError ? (
                <div className="flex items-center justify-center py-10 text-sm text-gray-400">{trendError}</div>
              ) : trendData ? (
                <TrendChart result={trendData} />
              ) : null}
            </div>

            {m && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                <MetricCard label="최고 지수" value={String(m.max)} sub={m.maxMonth} />
                <MetricCard label="최저 지수" value={String(m.min)} sub={m.minMonth} />
                <MetricCard label="평균" value={String(m.avg)} sub="12개월" />
                <MetricCard label="최근 3개월" value={String(m.recent3Avg)} sub={`직전 ${m.prev3Avg}`} />
                <MetricCard
                  label="성장률"
                  value={`${m.growthRate > 0 ? '+' : ''}${m.growthRate}%`}
                  sub="vs 직전 3개월"
                  accent={m.growthRate > 5 ? 'text-green-600' : m.growthRate < -5 ? 'text-red-500' : 'text-gray-600'}
                />
                <MetricCard
                  label="변동성"
                  value={`${m.volatility}%`}
                  sub="최고·최저 진폭"
                  accent={m.volatility > 60 ? 'text-orange-500' : m.volatility > 30 ? 'text-amber-500' : 'text-gray-600'}
                />
              </div>
            )}
          </div>

          {/* Sentiment keyword clouds */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">감성 키워드 맵</h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Groq AI</span>
              </div>
              {sentimentData?.total_posts !== undefined && sentimentData.total_posts > 0 && (
                <span className="text-xs text-gray-400">{sentimentData.total_posts}건 분석</span>
              )}
            </div>

            {sentimentLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-8">
                <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-400">AI 감성 분석 중...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <h3 className="text-xs font-bold text-green-800">긍정 키워드</h3>
                  </div>
                  <WordCloud words={sentimentData?.positive ?? []} baseColor="#16a34a" />
                </div>
                <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <h3 className="text-xs font-bold text-red-800">부정 키워드</h3>
                  </div>
                  <WordCloud words={sentimentData?.negative ?? []} baseColor="#dc2626" />
                </div>
                {sentimentData?.summary && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">AI 감성 요약</p>
                    <p className="text-xs leading-relaxed text-gray-700">{sentimentData.summary}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <InsightsPanel keyword={selKw} trendData={trendData} sentimentData={sentimentData} />
        </div>
      </div>
    </div>
  )
}
