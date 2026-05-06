'use client'

import { useState } from 'react'
import { RefreshCw, Clock, TrendingUp, Heart, MessageCircle, Eye, Share2, ExternalLink, Flame } from 'lucide-react'
import MarketNav from './MarketNav'

// ── SNS 플랫폼 데이터 ──────────────────────────────────────────────
const SNS_PLATFORMS = [
  {
    name: 'Instagram',
    key: 'instagram',
    gradient: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)',
    posts: 2840,
    avgEngagement: '4.82%',
    topHashtag: '#aestheticmedicine',
    weeklyGrowth: '+12.4%',
    icon: '📸',
  },
  {
    name: 'YouTube',
    key: 'youtube',
    gradient: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
    posts: 412,
    avgEngagement: '6.91%',
    topHashtag: '#skincare',
    weeklyGrowth: '+8.7%',
    icon: '▶',
  },
  {
    name: 'LinkedIn',
    key: 'linkedin',
    gradient: 'linear-gradient(135deg, #0077b5 0%, #004d7a 100%)',
    posts: 1230,
    avgEngagement: '3.14%',
    topHashtag: '#medicalaesthetics',
    weeklyGrowth: '+21.3%',
    icon: 'in',
  },
  {
    name: 'TikTok',
    key: 'tiktok',
    gradient: 'linear-gradient(135deg, #111827 0%, #374151 60%, #69c9d0 100%)',
    posts: 6710,
    avgEngagement: '8.45%',
    topHashtag: '#dermatologist',
    weeklyGrowth: '+34.1%',
    icon: '♪',
  },
  {
    name: 'Threads',
    key: 'threads',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
    posts: 890,
    avgEngagement: '2.38%',
    topHashtag: '#beautytech',
    weeklyGrowth: '+5.2%',
    icon: '@',
  },
]

// ── 트렌딩 해시태그 ──────────────────────────────────────────────
const TRENDING_HASHTAGS = [
  { tag: '#aestheticmedicine', count: 182400, hot: true },
  { tag: '#medicalaesthetics', count: 145200, hot: true },
  { tag: '#dermatologist', count: 98700, hot: true },
  { tag: '#skincare', count: 87300, hot: false },
  { tag: '#HIFU', count: 45200, hot: false },
  { tag: '#Thermage', count: 38900, hot: false },
  { tag: '#RFlifting', count: 31400, hot: false },
  { tag: '#kol', count: 22100, hot: false },
  { tag: '#beautytech', count: 18700, hot: false },
  { tag: '#ultherapy', count: 15600, hot: false },
  { tag: '#bodytoning', count: 12300, hot: false },
  { tag: '#rfjdermo', count: 9800, hot: false },
  { tag: '#Volnewmer', count: 8900, hot: false },
  { tag: '#EMFACE', count: 7400, hot: false },
  { tag: '#picowave', count: 5100, hot: false },
]

// ── KOL 인플루언서 ──────────────────────────────────────────────
interface KOL {
  name: string
  handle: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin'
  specialty: string
  country: string
  followers: string
  engagement: string
  recentPosts: number
  trend: 'up' | 'stable' | 'down'
  initials: string
  color: string
  recentHighlight: string
}

const KOLS: KOL[] = [
  {
    name: 'Dr. Shereene Idriss',
    handle: '@shereeneidriss',
    platform: 'instagram',
    specialty: '피부과·항노화',
    country: '🇺🇸 USA',
    followers: '1.24M',
    engagement: '5.8%',
    recentPosts: 12,
    trend: 'up',
    initials: 'SI',
    color: '#ee2a7b',
    recentHighlight: 'HIFU 리얼 시술 Reels — 48h 내 2.8M 조회',
  },
  {
    name: 'Dr. Muneeb Shah',
    handle: '@dermdoctor',
    platform: 'tiktok',
    specialty: '피부과·소비자 교육',
    country: '🇺🇸 USA',
    followers: '12.8M',
    engagement: '9.2%',
    recentPosts: 21,
    trend: 'up',
    initials: 'MS',
    color: '#69c9d0',
    recentHighlight: 'RF 리프팅 비교 시리즈 3편 완결 — 총 18M 뷰',
  },
  {
    name: 'Dr. Sandra Lee',
    handle: '@drpimplepopper',
    platform: 'youtube',
    specialty: '피부과·버라이어티',
    country: '🇺🇸 USA',
    followers: '7.41M',
    engagement: '6.3%',
    recentPosts: 8,
    trend: 'stable',
    initials: 'SL',
    color: '#cc0000',
    recentHighlight: '비침습 리프팅 vs 필러 비교 영상 3.2M 뷰',
  },
  {
    name: 'Dr. Anthony Youn',
    handle: '@dryoun',
    platform: 'tiktok',
    specialty: '성형외과·안티에이징',
    country: '🇺🇸 USA',
    followers: '7.1M',
    engagement: '7.4%',
    recentPosts: 18,
    trend: 'up',
    initials: 'AY',
    color: '#6228d7',
    recentHighlight: '"의사가 추천하는 리프팅" 시리즈 누적 25M 뷰',
  },
  {
    name: 'Dr. Hyunjin Park',
    handle: '@drhyunjin_skin',
    platform: 'instagram',
    specialty: '피부과·K-Beauty',
    country: '🇰🇷 Korea',
    followers: '890K',
    engagement: '6.9%',
    recentPosts: 15,
    trend: 'up',
    initials: 'HP',
    color: '#002D74',
    recentHighlight: '한국 최신 리프팅 트렌드 Reels — 아시아 전파 중',
  },
  {
    name: 'Dr. Yuki Tanaka',
    handle: '@dr.tanaka_skin',
    platform: 'instagram',
    specialty: '피부과·레이저 전문',
    country: '🇯🇵 Japan',
    followers: '520K',
    engagement: '5.1%',
    recentPosts: 9,
    trend: 'stable',
    initials: 'YT',
    color: '#0084C9',
    recentHighlight: '피코레이저 vs 프락셀 비교 콘텐츠 반응 폭발적',
  },
]

// ── 캠페인 스포트라이트 ──────────────────────────────────────────
const CAMPAIGNS = [
  {
    brand: 'Allergan Aesthetics',
    name: '#RealResults',
    platforms: ['instagram', 'tiktok'],
    summary: '글로벌 동시 런칭. 실제 환자 사례 중심 UGC 캠페인. 첫 2주 누적 인상 42M 돌파.',
    kpi: { impressions: '42M', engagement: '6.2%', sentiment: '94% 긍정' },
    color: '#002D74',
  },
  {
    brand: 'Galderma',
    name: 'Real Doctor Series',
    platforms: ['youtube', 'linkedin'],
    summary: '리얼닥터 콜라보 YouTube 의학 정보 시리즈. 구독자 의료진 신뢰도 기반 전환.',
    kpi: { impressions: '4.2M', engagement: '8.1%', sentiment: '97% 긍정' },
    color: '#0084C9',
  },
  {
    brand: 'Merz Aesthetics',
    name: 'Live Q&A Series',
    platforms: ['tiktok', 'instagram'],
    summary: 'TikTok Live 의료진 Q&A 포맷. 경쟁사 대비 참여율 +34%, 팔로워 전환율 업계 최고.',
    kpi: { impressions: '8.9M', engagement: '11.4%', sentiment: '91% 긍정' },
    color: '#6d28d9',
  },
]

const PLATFORM_BADGE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: '#fdf2f8', text: '#be185d', label: 'IG' },
  tiktok: { bg: '#f0f9ff', text: '#0369a1', label: 'TK' },
  youtube: { bg: '#fef2f2', text: '#dc2626', label: 'YT' },
  linkedin: { bg: '#eff6ff', text: '#1d4ed8', label: 'LI' },
  threads: { bg: '#f9fafb', text: '#374151', label: 'TH' },
}

const TREND_BADGE = {
  up: { label: '↑ 상승', className: 'text-emerald-600 bg-emerald-50' },
  stable: { label: '→ 유지', className: 'text-gray-500 bg-gray-50' },
  down: { label: '↓ 하락', className: 'text-rose-500 bg-rose-50' },
}

export default function InfluencerClient() {
  const [activeTab, setActiveTab] = useState<'all' | 'sns' | 'kol' | 'campaign'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-05-06 08:30')

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const now = new Date()
    setLastUpdated(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    setRefreshing(false)
  }

  const showSns = activeTab === 'all' || activeTab === 'sns'
  const showKol = activeTab === 'all' || activeTab === 'kol'
  const showCampaign = activeTab === 'all' || activeTab === 'campaign'

  return (
    <div className="flex min-h-full flex-col bg-white">
      <MarketNav />

      {/* 헤더 */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Marketing & KOL</h1>
            <p className="mt-0.5 text-sm text-gray-500">SNS 피드 동향 · 글로벌 인플루언서 분석 · 캠페인 리뷰</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
            새로고침
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>마지막 업데이트: {lastUpdated} · 1시간 자동 갱신</span>
        </div>
      </div>

      {/* 섹션 필터 탭 */}
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
        <div className="flex gap-2">
          {([['all', '전체 보기'], ['sns', 'SNS 피드'], ['kol', 'KOL 분석'], ['campaign', '캠페인']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={['rounded-xl px-4 py-2 text-sm font-medium transition-colors', activeTab === key ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'].join(' ')}
              style={activeTab === key ? { background: '#002D74' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-8 p-6 max-w-6xl mx-auto w-full">

        {/* ━━ SNS 플랫폼 현황 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showSns && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#002D74' }} />
              <h2 className="text-base font-bold" style={{ color: '#2C3E50' }}>SNS 플랫폼별 의료미용 콘텐츠 동향</h2>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                <Flame className="h-3 w-3" /> 실시간
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SNS_PLATFORMS.map((p) => (
                <div
                  key={p.key}
                  className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-transform hover:-translate-y-0.5"
                  style={{ background: p.gradient }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xl font-bold opacity-90">{p.icon}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                      {p.weeklyGrowth}
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-semibold opacity-95">{p.name}</p>
                  <p className="mb-3 text-2xl font-bold">{p.posts.toLocaleString()}<span className="ml-1 text-xs font-normal opacity-70">posts/day</span></p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-70">평균 참여율</span>
                      <span className="font-semibold">{p.avgEngagement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Top 해시태그</span>
                      <span className="font-semibold truncate ml-1">{p.topHashtag}</span>
                    </div>
                  </div>
                  {/* 참여율 시각 바 */}
                  <div className="mt-3 h-1 w-full rounded-full bg-white/20">
                    <div
                      className="h-1 rounded-full bg-white/80"
                      style={{ width: `${Math.min(100, parseFloat(p.avgEngagement) * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 트렌딩 해시태그 클라우드 */}
            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base">🔥</span>
                <h3 className="text-sm font-semibold" style={{ color: '#2C3E50' }}>트렌딩 해시태그 (지난 7일)</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {TRENDING_HASHTAGS.map(({ tag, count, hot }, i) => {
                  const fontSize = i === 0 ? 'text-xl' : i < 3 ? 'text-lg' : i < 6 ? 'text-base' : i < 10 ? 'text-sm' : 'text-xs'
                  const weight = i < 3 ? 'font-bold' : i < 7 ? 'font-semibold' : 'font-medium'
                  const opacity = i < 4 ? '' : i < 8 ? 'opacity-80' : 'opacity-60'
                  return (
                    <span
                      key={tag}
                      className={`${fontSize} ${weight} ${opacity} cursor-pointer rounded-full px-3 py-1.5 transition-all hover:opacity-100 hover:scale-105`}
                      style={{
                        background: hot ? 'rgba(238, 42, 123, 0.08)' : `rgba(0, 45, 116, ${0.06 + (15 - i) * 0.015})`,
                        color: hot ? '#be185d' : '#002D74',
                        border: hot ? '1px solid rgba(238,42,123,0.3)' : '1px solid rgba(0,45,116,0.15)',
                      }}
                    >
                      {tag}
                      {hot && <span className="ml-1 text-[10px]">🔥</span>}
                      <span className="ml-1.5 text-xs" style={{ opacity: 0.5 }}>
                        {count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ━━ KOL 인플루언서 분석 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showKol && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">👥</span>
              <h2 className="text-base font-bold" style={{ color: '#2C3E50' }}>글로벌 KOL 스포트라이트</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {KOLS.map((kol) => {
                const pb = PLATFORM_BADGE_STYLE[kol.platform]
                const tb = TREND_BADGE[kol.trend]
                const engNum = parseFloat(kol.engagement)
                return (
                  <div key={kol.handle} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    {/* 프로필 헤더 */}
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                        style={{ background: kol.color }}
                      >
                        {kol.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <p className="truncate text-sm font-semibold" style={{ color: '#2C3E50' }}>{kol.name}</p>
                            <p className="text-xs text-gray-400">{kol.handle}</p>
                          </div>
                          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${tb.className}`}>
                            {tb.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 메타 뱃지 */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      <span className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: pb.bg, color: pb.text }}>
                        {pb.label}
                      </span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600">{kol.specialty}</span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600">{kol.country}</span>
                    </div>

                    {/* 팔로워 통계 */}
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-gray-50 p-2 text-center">
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{kol.followers}</p>
                        <p className="text-[10px] text-gray-400">팔로워</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-2 text-center">
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{kol.engagement}</p>
                        <p className="text-[10px] text-gray-400">참여율</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-2 text-center">
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{kol.recentPosts}</p>
                        <p className="text-[10px] text-gray-400">주간 포스트</p>
                      </div>
                    </div>

                    {/* 참여율 바 */}
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                        <span>참여율</span>
                        <span>{kol.engagement}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, engNum * 8)}%`, background: kol.color }}
                        />
                      </div>
                    </div>

                    {/* 최신 하이라이트 */}
                    <div className="rounded-xl p-2.5" style={{ background: `${kol.color}0d` }}>
                      <p className="text-[10px] font-semibold mb-0.5" style={{ color: kol.color }}>최근 주목 콘텐츠</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{kol.recentHighlight}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ━━ 캠페인 스포트라이트 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showCampaign && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-base font-bold" style={{ color: '#2C3E50' }}>경쟁사 캠페인 스포트라이트</h2>
            </div>

            <div className="space-y-4">
              {CAMPAIGNS.map((c, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow"
                        style={{ background: c.color }}
                      >
                        {c.brand.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold" style={{ color: '#2C3E50' }}>{c.brand}</p>
                          <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: c.color }}>
                            {c.name}
                          </span>
                        </div>
                        <div className="mb-2 flex gap-1.5">
                          {c.platforms.map((pl) => {
                            const pb = PLATFORM_BADGE_STYLE[pl]
                            return (
                              <span key={pl} className="rounded-lg px-2 py-0.5 text-xs font-medium" style={{ background: pb.bg, color: pb.text }}>
                                {pb.label}
                              </span>
                            )
                          })}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{c.summary}</p>
                      </div>
                    </div>

                    {/* KPI */}
                    <div className="shrink-0 grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-0.5">
                          <Eye className="h-3 w-3" /><span>노출</span>
                        </div>
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{c.kpi.impressions}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-0.5">
                          <Heart className="h-3 w-3" /><span>참여율</span>
                        </div>
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{c.kpi.engagement}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-0.5">
                          <MessageCircle className="h-3 w-3" /><span>감성</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-600">{c.kpi.sentiment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
