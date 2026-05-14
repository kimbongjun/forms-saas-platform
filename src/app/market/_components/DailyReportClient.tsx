'use client'

import { useState } from 'react'
import {
  BarChart2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Globe,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  Building2,
  ArrowRight,
  Play,
  AlertCircle,
} from 'lucide-react'
import MarketNav from './MarketNav'
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'

const REPORT_DATE = '2026.05.07'
const LAST_UPDATED = '2026-05-07 09:10'

// ── Competitor Pulse ─────────────────────────────────────────────
const COMPETITOR_PULSE = [
  {
    company: 'InMode',
    update: 'Morpheus8 Body FDA 510(k) 허가 완료',
    date: '2026-04',
    classsysAction: 'VOLNEWMER 바디 적응증 데이터 선제적 공개로 대응 필요',
    color: 'bg-violet-50 border-violet-200',
    textColor: 'text-violet-700',
  },
  {
    company: 'Merz',
    update: 'Ultherapy PRIME AMWC 2026 유럽 론칭',
    date: '2026-03',
    classsysAction: 'Ultraformer MPT vs Ultherapy PRIME 비교 임상 자료 업데이트',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    company: 'Solta',
    update: 'Thermage FLX 5th Gen 아시아 공식 론칭',
    date: '2026-04',
    classsysAction: '아시아 주요 KOL 대상 슈링크 vs Thermage 포지셔닝 메시지 재정비',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    company: 'Alma',
    update: 'Soprano Titanium 한국 식약처 허가 취득',
    date: '2026-05',
    classsysAction: '국내 제모 레이저 시장 진입 모니터링 강화 및 포트폴리오 대응 검토',
    color: 'bg-rose-50 border-rose-200',
    textColor: 'text-rose-700',
  },
]

// ── Market Signals ────────────────────────────────────────────────
type SignalRelevance = 'high' | 'mid' | 'low'
type Signal = {
  category: string
  title: string
  detail: string
  classsysRelevance: SignalRelevance
  date: string
}

const MARKET_SIGNALS: Signal[] = [
  { category: 'Technology', title: 'AI 기반 HIFU 깊이 타기팅 정확도 95% 달성 연구 발표', detail: 'AI 트랜스듀서 제어로 HIFU 조사 정확도 혁신. 차기 HIFU 장비 차별화 포인트로 부상.', classsysRelevance: 'high', date: '2026-05-01' },
  { category: 'Technology', title: 'RF + 마이크로니들 복합 프로토콜 콜라겐 40% 향상 임상 발표', detail: 'RF 마이크로니들 후 PDRN 병용 시 콜라겐 생성 40% 증가. VOLNEWMER 번들 기회.', classsysRelevance: 'high', date: '2026-04-25' },
  { category: 'AI/SaMD', title: '생성형 AI 시술 시뮬레이션 환자 상담 전환율 향상', detail: '시술 전후 결과 사전 시각화 도구가 병원 동의율 높임. 장비 번들 가능성.', classsysRelevance: 'high', date: '2026-05-04' },
  { category: 'Regulatory', title: '미국 FDA 에스테틱 장비 510(k) 허가 건수 18% 증가', detail: 'AI 통합 장비 허가 비중 확대. CLASSYS 미국 진출 전략 업데이트 필요.', classsysRelevance: 'high', date: '2026-04-18' },
  { category: 'Technology', title: '피코초 레이저 아시아 피부 타입 색소 임상 근거 강화', detail: '아시아 피부 최적화 피코초 레이저 임상 데이터 누적. 국내 경쟁 심화.', classsysRelevance: 'mid', date: '2026-05-03' },
  { category: 'Regulatory', title: 'Korea MFDS 디지털 헬스 가이던스 업데이트', detail: 'AI 에스테틱 장비 허가 범위 확대. 국내 AI 통합 제품 허가 전략 재검토.', classsysRelevance: 'high', date: '2026-04-05' },
  { category: 'AI/SaMD', title: 'AI 피부 노화 평가 전문의 판정과 92% 일치 검증', detail: 'SaMD 등록 가능한 AI 평가 모듈. 장비 번들 판매 차별화 기회.', classsysRelevance: 'mid', date: '2026-04-22' },
  { category: 'Regulatory', title: '중국 NMPA 혁신 에스테틱 장비 신속 심사 경로 도입', detail: '혁신 기기 허가 기간 30% 단축. 클래시스 중국 진출 가속화 기회.', classsysRelevance: 'high', date: '2026-03-28' },
]

// ── Event Radar ───────────────────────────────────────────────────
const EVENT_RADAR = [
  { name: 'IMCAS Asia 2026', date: '2026-06-11', city: 'Bangkok', isAttending: false, competitors: ['Merz', 'Solta', 'InMode'] },
  { name: 'AMWC Asia 2026', date: '2026-07-11', city: 'Macau', isAttending: false, competitors: ['Merz', 'Alma'] },
  { name: 'AAD Summer 2026', date: '2026-07-25', city: 'New York', isAttending: false, competitors: ['Candela', 'InMode'] },
  { name: 'IMCAS China 2026', date: '2026-09-12', city: 'Shanghai', isAttending: true, competitors: ['Merz', 'Solta', 'InMode'] },
  { name: 'EADV Congress 2026', date: '2026-10-07', city: 'Amsterdam', isAttending: false, competitors: ['Alma', 'Candela', 'Cynosure'] },
]

// ── KOL & Campaign Watch ──────────────────────────────────────────
const SPOTLIGHT_KOLS = [
  { name: 'Dr. Jason Diamond', handle: '@drjasondiamond', platform: 'Instagram+YouTube', followers: '1.2M', specialty: 'Plastic Surgeon', country: 'USA', youtubeVideoId: 'jNQXAC9IVRw' },
  { name: 'Dr. Vicki Belo', handle: '@vickibelodoctora', platform: 'Instagram+YouTube', followers: '2.1M', specialty: 'Dermatologist', country: 'Philippines', youtubeVideoId: 'dQw4w9WgXcQ' },
  { name: 'Dr. Kim Sang-hyun', handle: '@dr.kimsh', platform: 'Instagram', followers: '285K', specialty: 'Plastic Surgeon', country: 'Korea', youtubeVideoId: undefined },
]

const CAMPAIGN_HIGHLIGHTS = [
  { brand: 'InMode', name: 'Morpheus8 Body Transform Your Story', impressions: '45M', engagement: '3.2%', sentiment: '94%', youtubeVideoId: 'lXIl2QLLOMU' },
  { brand: 'Merz', name: 'Real Results Ultherapy 2025', impressions: '32M', engagement: '2.8%', sentiment: '91%', youtubeVideoId: 'oLsreHEfkFk' },
]

// ── Global Market Snapshot ────────────────────────────────────────
const MARKET_KPIS = [
  { label: '글로벌 시장 규모', value: '$21.1B', sub: '2025년 기준' },
  { label: '연평균 성장률 (CAGR)', value: '14.8%', sub: '2025–2030' },
  { label: '아시아 태평양 비중', value: '40.8%', sub: '전체 시장 대비' },
  { label: '비침습 시술 비중', value: '68%', sub: '에너지 기반 장비' },
]

const REGIONAL_GROWTH = [
  { region: 'Asia Pacific', growth: '17.2%', size: '$8.6B', leader: 'HIFU · RF' },
  { region: 'North America', growth: '13.1%', size: '$6.4B', leader: 'RF · Laser' },
  { region: 'Europe', growth: '12.8%', size: '$4.2B', leader: 'Injectables · HIFU' },
  { region: 'Middle East', growth: '16.4%', size: '$1.2B', leader: 'Laser · RF' },
  { region: 'Latin America', growth: '14.9%', size: '$0.7B', leader: 'RF · Body' },
]

const CATEGORY_SHARE = [
  { name: 'HIFU / RF', share: 38, color: '#002D74' },
  { name: 'Laser', share: 27, color: '#0084C9' },
  { name: 'Injectables', share: 22, color: '#7c3aed' },
  { name: 'Body Contouring', share: 13, color: '#059669' },
]

// ── Core sources ──────────────────────────────────────────────────
const TOP_SOURCES = [
  { name: 'CLASSYS', url: 'https://classys.com/' },
  { name: 'Merz Aesthetics', url: 'https://www.merz-aesthetics.com/' },
  { name: 'Solta Medical', url: 'https://www.soltamedical.com/' },
  { name: 'InMode', url: 'https://inmodemd.com/' },
  { name: 'FDA', url: 'https://www.fda.gov/medical-devices' },
  { name: 'MedTech Europe', url: 'https://www.medtecheurope.org/' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function daysUntil(dateStr: string) {
  const today = new Date()
  const target = new Date(dateStr)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function DailyReportClient() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED)
  const [showAllSignals, setShowAllSignals] = useState(false)

  const { data: dailyArticles = [], isLoading: isDailyLoading } = useMarketArticles({ category: 'daily', limit: 20 })
  const { data: topArticles = [] } = useMarketArticles({ tier: 'top', limit: 6 })

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const now = new Date()
    setLastUpdated(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setRefreshing(false)
  }

  const highSignals = MARKET_SIGNALS.filter(s => s.classsysRelevance === 'high')
  const visibleSignals = showAllSignals ? MARKET_SIGNALS : highSignals

  return (
    <div className="min-h-full bg-[#f7f8fb]">
      <MarketNav />

      {/* Hero header */}
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#002D74_0%,#0084C9_100%)] px-6 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-100">
                <Globe className="h-4 w-4" />
                <span>Global Medical Aesthetics Intelligence Hub</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{REPORT_DATE} Daily Report</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100">
                경쟁사 동향, 시장 시그널, 이벤트 레이더, KOL 캠페인 워치, 글로벌 스냅샷을 한 화면에서 운영합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-6 space-y-6">

        {/* Panel 1: Competitor Pulse */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#002D74]" />
              <div>
                <h2 className="text-base font-bold text-slate-950">Competitor Pulse</h2>
                <p className="text-xs text-slate-400">최근 주목할 경쟁사 동향 및 CLASSYS 대응 포인트</p>
              </div>
            </div>
            <a
              href="/market/competitors"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#002D74] hover:underline"
            >
              View All Competitors <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {COMPETITOR_PULSE.map(item => (
              <div key={item.company} className={`rounded-2xl border p-4 ${item.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-bold ${item.textColor}`}>{item.company}</span>
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-slate-800">{item.update}</p>
                <div className="mt-3 rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">CLASSYS 대응</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-700">{item.classsysAction}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Panel 2: Market Signals */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-violet-600" />
              <div>
                <h2 className="text-base font-bold text-slate-950">Market Signals</h2>
                <p className="text-xs text-slate-400">Technology · AI/SaMD · Regulatory 통합 시그널</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAllSignals(v => !v)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {showAllSignals ? 'High only' : `전체 보기 (${MARKET_SIGNALS.length})`}
              </button>
              <a
                href="/market/tech-ai"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#002D74] hover:underline"
              >
                View Tech & AI <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
          {isDailyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : dailyArticles.length > 0 ? (
            <div className="space-y-3">
              {dailyArticles.map((article: MarketArticle) => (
                <a
                  key={article.id}
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-[#002D74] hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={[
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          article.priority_tier === 'top' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600',
                        ].join(' ')}>
                          {article.priority_tier === 'top' ? '주요' : '일반'}
                        </span>
                        <span className="text-xs text-gray-400 truncate">{article.source_name}</span>
                      </div>
                      <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
                      {article.key_insight && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-1">💡 {article.key_insight}</p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-gray-300 mt-1" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleSignals.map(signal => (
                <div key={signal.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        signal.classsysRelevance === 'high' ? 'bg-red-100 text-red-700' :
                        signal.classsysRelevance === 'mid' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {signal.classsysRelevance.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400">{signal.category}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{signal.date}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-slate-800">{signal.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{signal.detail}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Panel 3: Event Radar */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-teal-600" />
              <div>
                <h2 className="text-base font-bold text-slate-950">Event Radar</h2>
                <p className="text-xs text-slate-400">향후 60일 이내 주요 이벤트</p>
              </div>
            </div>
            <a
              href="/market/events"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#002D74] hover:underline"
            >
              View All Events <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Event</th>
                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Date</th>
                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">City</th>
                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">CLASSYS</th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">경쟁사 참가</th>
                </tr>
              </thead>
              <tbody>
                {EVENT_RADAR.map(ev => {
                  const days = daysUntil(ev.date)
                  return (
                    <tr key={ev.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-semibold text-slate-800">{ev.name}</td>
                      <td className="py-3 pr-4 text-slate-500">
                        {formatDate(ev.date)}
                        {days > 0 && days <= 60 && (
                          <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">D-{days}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{ev.city}</td>
                      <td className="py-3 pr-4">
                        {ev.isAttending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                            <CheckCircle2 className="h-3 w-3" /> 참가
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">미참가</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {ev.competitors.map(c => (
                            <span key={c} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{c}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Panel 4: KOL & Campaign Watch */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-pink-600" />
              <div>
                <h2 className="text-base font-bold text-slate-950">KOL & Campaign Watch</h2>
                <p className="text-xs text-slate-400">이달의 주목 KOL 및 경쟁사 캠페인 하이라이트</p>
              </div>
            </div>
            <a
              href="/market/marketing-influencer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#002D74] hover:underline"
            >
              View KOL & Campaigns <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* KOL spotlight */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">이달의 주목 KOL</h3>
              <div className="space-y-3">
                {SPOTLIGHT_KOLS.map(kol => (
                  <div key={kol.name} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    {kol.youtubeVideoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${kol.youtubeVideoId}/mqdefault.jpg`}
                        alt={kol.name}
                        className="h-16 w-24 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-16 w-24 shrink-0 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-pink-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{kol.name}</p>
                      <p className="text-xs text-slate-500">{kol.handle} · {kol.country}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{kol.followers}</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{kol.platform}</span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{kol.specialty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign highlights */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">경쟁사 캠페인 하이라이트</h3>
              <div className="space-y-3">
                {CAMPAIGN_HIGHLIGHTS.map(camp => (
                  <div key={camp.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={`https://img.youtube.com/vi/${camp.youtubeVideoId}/mqdefault.jpg`}
                          alt={camp.name}
                          className="h-20 w-32 rounded-xl object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow">
                            <Play className="ml-0.5 h-4 w-4 text-slate-800" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-400">{camp.brand}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-800 line-clamp-2">{camp.name}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          <span className="text-slate-500">👁 {camp.impressions}</span>
                          <span className="text-slate-500">💬 {camp.engagement}</span>
                          <span className="text-emerald-600">✓ {camp.sentiment}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Panel 5: Global Market Snapshot */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <BarChart2 className="h-5 w-5 text-[#002D74]" />
            <div>
              <h2 className="text-base font-bold text-slate-950">Global Market Snapshot</h2>
              <p className="text-xs text-slate-400">글로벌 에스테틱 의료기기 시장 현황 (2025–2026)</p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
            {MARKET_KPIS.map(kpi => (
              <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold tracking-tight text-[#002D74]">{kpi.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{kpi.label}</p>
                <p className="text-[11px] text-slate-400">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Regional growth table */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">지역별 성장률</h3>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400">Region</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400">CAGR</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400">Size</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400">Leader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONAL_GROWTH.map(row => (
                      <tr key={row.region} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{row.region}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-600">{row.growth}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.size}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">{row.leader}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category share */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">카테고리 시장 점유율</h3>
              <div className="space-y-3">
                {CATEGORY_SHARE.map(cat => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      <span className="text-sm font-bold text-slate-800">{cat.share}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core sources */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-950 mb-3">Core sources</h2>
          <div className="flex flex-wrap gap-2">
            {TOP_SOURCES.map(source => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <ExternalLink className="h-3 w-3" />
                {source.name}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
