'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo, useCallback } from 'react'
import {
  COMPETITORS,
  type Competitor,
  type Region,
  type DeviceCategory,
  type Tier,
  type DataConfidence,
} from '../_data/competitors'
import type { EnrichResult } from '@/app/api/market/enrich/route'
import CompetitorCard from './CompetitorCard'
import CompetitorModal from './CompetitorModal'
import MarketDotModal from './MarketDotModal'
import SpecTable from './SpecTable'
import EventsTab from './EventsTab'
import InsightsTab from './InsightsTab'

const PositioningMap = dynamic(() => import('./PositioningMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-72 bg-gray-50 rounded-xl border border-gray-200">
      <span className="text-sm text-gray-400">포지셔닝 맵 로딩 중…</span>
    </div>
  ),
})

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-56 bg-gray-50 rounded-xl border border-gray-200">
      <span className="text-sm text-gray-400">세계지도 로딩 중…</span>
    </div>
  ),
})

const ProfilesTab = dynamic(() => import('./ProfilesTab'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-72 bg-gray-50 rounded-xl border border-gray-200">
      <span className="text-sm text-gray-400">프로필 로딩 중…</span>
    </div>
  ),
})

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const CATEGORIES: DeviceCategory[] = ['HIFU', 'RF', 'NeedleRF', 'Laser', 'Body', 'Injection', 'Combo']
const TIERS: Tier[] = ['Tier1', 'Tier2', 'Emerging']

export const TIER_COLORS: Record<Tier, string> = {
  Tier1: 'bg-violet-100 text-violet-700 border-violet-200',
  Tier2: 'bg-blue-100 text-blue-700 border-blue-200',
  Emerging: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const CONFIDENCE_BADGE: Record<DataConfidence['level'], { label: string; cls: string }> = {
  verified: { label: '공시 검증', cls: 'bg-green-50 text-green-700 border-green-200' },
  estimated: { label: '업계추정', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  'ai-enriched': { label: 'AI 검증', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
}

type TabKey = 'overview' | 'specs' | 'events' | 'profiles' | 'insights'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '개요' },
  { key: 'specs', label: '제품·스펙' },
  { key: 'events', label: '이벤트·PR' },
  { key: 'profiles', label: '경쟁사 프로필' },
  { key: 'insights', label: 'AI 인사이트' },
]

const COMING_SOON: string[] = []

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  )
}

function isMatch(c: Competitor, regions: Set<Region>, categories: Set<DeviceCategory>, tiers: Set<Tier>): boolean {
  if (c.is_classys) return true
  const regionOk = regions.size === 0 || c.markets.some((m) => regions.has(m))
  const catOk = categories.size === 0 || c.device_categories.some((d) => categories.has(d))
  const tierOk = tiers.size === 0 || tiers.has(c.tier)
  return regionOk && catOk && tierOk
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function mergeEnrichedData(base: Competitor, enriched: EnrichResult): Competitor {
  return {
    ...base,
    device_categories: enriched.verified_device_categories as DeviceCategory[],
    products: enriched.verified_products.map((vp) => ({
      product_name: vp.product_name,
      category: vp.category as DeviceCategory,
      launch_year: 0,
      price_tier: 'Mid' as const,
      certifications: vp.key_certifications,
      specs: { energy_type: vp.energy_type, notes: vp.source_url },
    })),
    confidence: {
      level: 'ai-enriched' as const,
      source: 'AI 검증' as const,
      verified_at: enriched.verified_at,
    },
  }
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function MarketClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const [selectedRegions, setSelectedRegions] = useState<Set<Region>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<DeviceCategory>>(new Set())
  const [selectedTiers, setSelectedTiers] = useState<Set<Tier>>(new Set())

  const [activeModal, setActiveModal] = useState<Competitor | null>(null)
  const [dotModalRegion, setDotModalRegion] = useState<Region | null>(null)

  const [enrichMap, setEnrichMap] = useState<Map<string, EnrichResult | 'loading' | 'error'>>(new Map())
  const [bulkEnriching, setBulkEnriching] = useState(false)
  const [enrichProgress, setEnrichProgress] = useState<{ done: number; total: number } | null>(null)

  // AI 검증 결과 머지
  const competitors = useMemo(
    () =>
      COMPETITORS.map((c) => {
        const enriched = enrichMap.get(c.competitor_id)
        if (enriched && enriched !== 'loading' && enriched !== 'error') {
          return mergeEnrichedData(c, enriched)
        }
        return c
      }),
    [enrichMap],
  )

  const matchSet = useMemo(
    () =>
      new Set(
        competitors
          .filter((c) => isMatch(c, selectedRegions, selectedCategories, selectedTiers))
          .map((c) => c.competitor_id),
      ),
    [competitors, selectedRegions, selectedCategories, selectedTiers],
  )

  const ordered = useMemo(() => {
    const matched = competitors.filter((c) => matchSet.has(c.competitor_id))
    const unmatched = competitors.filter((c) => !matchSet.has(c.competitor_id))
    const sort = (arr: Competitor[]) =>
      [...arr].sort((a, b) => (a.is_classys ? -1 : b.is_classys ? 1 : 0))
    return [...sort(matched), ...sort(unmatched)]
  }, [competitors, matchSet])

  const hasFilter = selectedRegions.size > 0 || selectedCategories.size > 0 || selectedTiers.size > 0

  const clearFilters = useCallback(() => {
    setSelectedRegions(new Set())
    setSelectedCategories(new Set())
    setSelectedTiers(new Set())
  }, [])

  const handleRegionToggle = useCallback((region: Region) => {
    setSelectedRegions((prev) => toggle(prev, region))
  }, [])

  // 단일 경쟁사 AI 검증
  const enrichOne = useCallback(async (c: Competitor) => {
    setEnrichMap((prev) => new Map(prev).set(c.competitor_id, 'loading'))
    try {
      const res = await fetch('/api/market/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitor_id: c.competitor_id, company_name: c.company_name }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as EnrichResult
      setEnrichMap((prev) => new Map(prev).set(c.competitor_id, data))
    } catch {
      setEnrichMap((prev) => new Map(prev).set(c.competitor_id, 'error'))
    }
  }, [])

  // 전체 AI 검증 (순차 — rate limit 방지)
  const enrichAll = useCallback(async () => {
    setBulkEnriching(true)
    const nonClassys = COMPETITORS.filter((c) => !c.is_classys)
    setEnrichProgress({ done: 0, total: nonClassys.length })
    for (let i = 0; i < nonClassys.length; i++) {
      await enrichOne(nonClassys[i])
      setEnrichProgress({ done: i + 1, total: nonClassys.length })
    }
    setBulkEnriching(false)
    setEnrichProgress(null)
  }, [enrichOne])

  const enrichedCount = [...enrichMap.values()].filter(
    (v) => v !== 'loading' && v !== 'error',
  ).length

  const maxRevenue = useMemo(
    () => Math.max(...COMPETITORS.map((c) => c.positioning.revenue_m)),
    [],
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 py-8">

        {/* ── 헤더 ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">시장조사</h1>
            <p className="mt-1 text-sm text-gray-500">경쟁사 인텔리전스 대시보드</p>
          </div>
          <div className="flex items-center gap-3">
            {enrichedCount > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                {enrichedCount}개사 AI 검증 완료
              </span>
            )}
            <button
              onClick={enrichAll}
              disabled={bulkEnriching}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {bulkEnriching ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {enrichProgress ? `${enrichProgress.done}/${enrichProgress.total}` : '검증 중'}
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI 데이터 검증
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── 탭 네비게이션 + 필터 바 (하나의 카드) ─────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8 overflow-hidden">
          {/* 탭 바 */}
          <div className="flex items-end overflow-x-auto px-5 pt-4 border-b border-gray-200 gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'relative flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors shrink-0',
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}

            {/* 준비중 탭 — 비활성화 상태로 전체 IA 미리보기 */}
            {COMING_SOON.map((label) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-5 py-2.5 whitespace-nowrap shrink-0 border-b-2 border-transparent -mb-px"
              >
                <span className="text-sm text-gray-300">{label}</span>
                <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-px rounded-full leading-tight">
                  준비중
                </span>
              </div>
            ))}
          </div>

          {/* 카테고리·티어 필터 (모든 탭 공통) */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">카테고리</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <FilterChip
                    key={c}
                    label={c === 'NeedleRF' ? 'NeedleRF (MNRF)' : c}
                    active={selectedCategories.has(c)}
                    onClick={() => setSelectedCategories((prev) => toggle(prev, c))}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">티어</span>
              <div className="flex flex-wrap gap-2">
                {TIERS.map((t) => (
                  <FilterChip
                    key={t}
                    label={t}
                    active={selectedTiers.has(t)}
                    onClick={() => setSelectedTiers((prev) => toggle(prev, t))}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <p className="text-xs text-gray-400">
                {hasFilter
                  ? `${matchSet.size}개사 매칭 · 전체 ${competitors.length}개사`
                  : `전체 ${competitors.length}개사 표시 중`}
              </p>
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:underline"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 탭 콘텐츠 ──────────────────────────────────────────────────── */}

        {/* Tab: 개요 */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <section>
              <SectionHeading title="진출 지역" sub="WorldMap 클릭 → 지역 필터 · dot 클릭 → 경쟁사 목록" />
              <WorldMap
                competitors={competitors}
                matchSet={matchSet}
                selectedRegions={selectedRegions}
                onRegionToggle={handleRegionToggle}
                onDotClick={(region) => setDotModalRegion(region)}
              />
            </section>

            <section>
              <SectionHeading
                title="경쟁사 Overview"
                sub={`${matchSet.size}개사 표시 중`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ordered.map((c) => (
                  <CompetitorCard
                    key={c.competitor_id}
                    competitor={c}
                    matched={matchSet.has(c.competitor_id)}
                    tierColors={TIER_COLORS}
                    confidenceBadge={CONFIDENCE_BADGE}
                    enrichStatus={enrichMap.get(c.competitor_id)}
                    onEnrich={() => enrichOne(c)}
                    onClick={() => setActiveModal(c)}
                    maxRevenue={maxRevenue}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeading title="포지셔닝 맵" sub="기술 수준(X) vs 가격대(Y) · 버블 크기 = 매출" />
              <PositioningMap competitors={competitors} matchSet={matchSet} />
            </section>
          </div>
        )}

        {/* Tab: 제품·스펙 */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            <SectionHeading
              title="제품 스펙 비교"
              sub={`${competitors.reduce((n, c) => n + c.products.length, 0)}개 제품 · ${competitors.length}개사`}
            />
            <SpecTable competitors={competitors} matchSet={matchSet} />
          </div>
        )}

        {/* Tab: 이벤트·PR */}
        {activeTab === 'events' && (
          <EventsTab competitors={competitors} matchSet={matchSet} />
        )}

        {/* Tab: 경쟁사 프로필 */}
        {activeTab === 'profiles' && (
          <ProfilesTab competitors={competitors} matchSet={matchSet} />
        )}

        {/* Tab: AI 인사이트 */}
        {activeTab === 'insights' && (
          <InsightsTab />
        )}
      </div>

      {/* ── 모달 ───────────────────────────────────────────────────────── */}
      {activeModal && (
        <CompetitorModal
          competitor={activeModal}
          tierColors={TIER_COLORS}
          onClose={() => setActiveModal(null)}
        />
      )}

      {dotModalRegion && (
        <MarketDotModal
          region={dotModalRegion}
          competitors={competitors}
          onClose={() => setDotModalRegion(null)}
        />
      )}
    </div>
  )
}

// ─── 섹션 헤딩 ────────────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}
