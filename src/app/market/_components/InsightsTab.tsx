'use client'

import { useState } from 'react'
import type { InsightResult, CategoryCompetition } from '@/app/api/market/insights/route'

const INTENSITY_META: Record<
  CategoryCompetition['intensity'],
  { label: string; cls: string; barCls: string }
> = {
  high: {
    label: '경쟁 심화',
    cls: 'bg-red-50 text-red-700 border-red-200',
    barCls: 'bg-red-400',
  },
  medium: {
    label: '경쟁 중간',
    cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    barCls: 'bg-yellow-400',
  },
  low: {
    label: '경쟁 낮음',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barCls: 'bg-emerald-400',
  },
}

export default function InsightsTab() {
  const [result, setResult] = useState<InsightResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/market/insights', { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? res.statusText)
      }
      setResult((await res.json()) as InsightResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 트리거 / 빈 상태 ─────────────────────────────────────────────── */}
      {!result && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div className="text-center max-w-sm">
            <p className="text-base font-semibold text-gray-800">AI 경쟁 인텔리전스 분석</p>
            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
              Claude AI가 경쟁사 데이터를 분석해 카테고리 경쟁 강도, 포지셔닝 기회 영역,
              시장 트렌드, Classys SWOT 요약을 제공합니다.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 max-w-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Claude 분석 중…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                AI 분석 생성
              </>
            )}
          </button>
        </div>
      )}

      {/* ── 결과 ────────────────────────────────────────────────────────────── */}
      {result && (
        <>
          {/* 재생성 바 */}
          <div className="flex items-center justify-between bg-blue-50 rounded-xl px-5 py-3 border border-blue-100">
            <div>
              <p className="text-xs font-semibold text-blue-800">AI 분석 완료</p>
              <p className="text-xs text-blue-400 mt-0.5">
                생성: {new Date(result.generated_at).toLocaleString('ko-KR')}
              </p>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? '분석 중…' : '재생성'}
            </button>
          </div>

          {/* 전략적 시사점 */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-2">
              전략적 시사점
            </p>
            <p className="text-base leading-relaxed">{result.strategic_summary}</p>
          </div>

          {/* 카테고리별 경쟁 강도 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">
              카테고리별 경쟁 강도
            </p>
            <div className="space-y-5">
              {result.category_competition.map((cc) => {
                const meta = INTENSITY_META[cc.intensity]
                const barWidth =
                  cc.intensity === 'high' ? 85 : cc.intensity === 'medium' ? 50 : 20
                return (
                  <div key={cc.category} className="flex items-start gap-4">
                    <div className="w-20 shrink-0 pt-0.5">
                      <p className="text-sm font-bold text-gray-800">{cc.category}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${meta.barCls}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span
                          className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full border font-medium ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">
                          {cc.competitors.length}개사
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{cc.note}</p>
                      {cc.competitors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cc.competitors.map((name) => (
                            <span
                              key={name}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 포지셔닝 기회 + 시장 트렌드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 포지셔닝 기회 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                포지셔닝 기회 영역
              </p>
              <div className="space-y-3">
                {result.positioning_gaps.map((gap, i) => {
                  const hue = Math.round(gap.opportunity_score * 12)
                  return (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-800">{gap.title}</p>
                        <span
                          className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg"
                          style={{
                            backgroundColor: `hsl(${hue}, 80%, 95%)`,
                            color: `hsl(${hue}, 55%, 35%)`,
                          }}
                        >
                          {gap.opportunity_score}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {gap.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 시장 트렌드 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                시장 트렌드 2025–27
              </p>
              <div className="space-y-4">
                {result.market_trends.map((trend, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Classys 강점 + 리스크 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-4">
                Classys 경쟁 강점
              </p>
              <div className="space-y-3">
                {result.classys_strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-emerald-800 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-4">
                주요 리스크
              </p>
              <div className="space-y-3">
                {result.classys_risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-800 leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
