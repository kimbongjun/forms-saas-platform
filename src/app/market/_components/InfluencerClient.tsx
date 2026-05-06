'use client'

import { useState } from 'react'
import { RefreshCw, Clock, TrendingUp, Heart, MessageCircle, Eye, Flame, Play, Image, Film, ExternalLink } from 'lucide-react'
import MarketNav from './MarketNav'

const SNS_PLATFORMS = [
  { name: 'Instagram', key: 'instagram', gradient: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)', posts: 2840, avgEngagement: '4.82%', topHashtag: '#aestheticmedicine', weeklyGrowth: '+12.4%', icon: '📸' },
  { name: 'YouTube', key: 'youtube', gradient: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)', posts: 412, avgEngagement: '6.91%', topHashtag: '#skincare', weeklyGrowth: '+8.7%', icon: '▶' },
  { name: 'LinkedIn', key: 'linkedin', gradient: 'linear-gradient(135deg, #0077b5 0%, #004d7a 100%)', posts: 1230, avgEngagement: '3.14%', topHashtag: '#medicalaesthetics', weeklyGrowth: '+21.3%', icon: 'in' },
  { name: 'TikTok', key: 'tiktok', gradient: 'linear-gradient(135deg, #111827 0%, #374151 60%, #69c9d0 100%)', posts: 6710, avgEngagement: '8.45%', topHashtag: '#dermatologist', weeklyGrowth: '+34.1%', icon: '♪' },
  { name: 'Threads', key: 'threads', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)', posts: 890, avgEngagement: '2.38%', topHashtag: '#beautytech', weeklyGrowth: '+5.2%', icon: '@' },
]

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

interface MediaItem {
  type: 'reel' | 'post' | 'video' | 'shorts' | 'live'
  caption: string
  views: string
  likes: string
  comments: string
  daysAgo: number
  duration?: string
  gradient: string
  icon: string
}

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
  profileUrl: string
  mediaGrid: MediaItem[]
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
    profileUrl: 'https://www.instagram.com/shereeneidriss',
    mediaGrid: [
      { type: 'reel', caption: 'HIFU 리얼 시술 after 48시간 ✨', views: '2.8M', likes: '142K', comments: '8.4K', daysAgo: 2, duration: '0:58', gradient: 'linear-gradient(135deg,#f9ce34,#ee2a7b)', icon: '▶' },
      { type: 'post', caption: 'RF vs HIFU — 어떤 게 맞을까요?', views: '380K', likes: '28K', comments: '2.1K', daysAgo: 5, gradient: 'linear-gradient(135deg,#ee2a7b,#6228d7)', icon: '📸' },
      { type: 'reel', caption: '안면 리프팅 시술 솔직 후기', views: '1.2M', likes: '91K', comments: '5.7K', daysAgo: 8, duration: '1:12', gradient: 'linear-gradient(135deg,#6228d7,#ee2a7b)', icon: '▶' },
      { type: 'post', caption: 'Botox vs 리프팅 기기 비교', views: '210K', likes: '19K', comments: '1.3K', daysAgo: 12, gradient: 'linear-gradient(135deg,#f9ce34,#6228d7)', icon: '📸' },
    ],
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
    profileUrl: 'https://www.tiktok.com/@dermdoctor',
    mediaGrid: [
      { type: 'video', caption: 'RF 리프팅 완전정복 EP3 🔥', views: '8.4M', likes: '1.2M', comments: '43K', daysAgo: 1, duration: '2:34', gradient: 'linear-gradient(135deg,#111827,#69c9d0)', icon: '♪' },
      { type: 'video', caption: '피부과 의사가 직접 받은 HIFU', views: '5.2M', likes: '780K', comments: '31K', daysAgo: 4, duration: '1:47', gradient: 'linear-gradient(135deg,#69c9d0,#111827)', icon: '♪' },
      { type: 'shorts', caption: '가장 효과적인 리프팅 기기는?', views: '3.1M', likes: '420K', comments: '18K', daysAgo: 7, duration: '0:59', gradient: 'linear-gradient(135deg,#374151,#69c9d0)', icon: '▶' },
      { type: 'live', caption: 'LIVE Q&A — 비침습 리프팅', views: '1.4M', likes: '230K', comments: '12K', daysAgo: 10, gradient: 'linear-gradient(135deg,#111827,#374151)', icon: '🔴' },
    ],
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
    profileUrl: 'https://www.youtube.com/@DrPimplePopper',
    mediaGrid: [
      { type: 'video', caption: '비침습 리프팅 vs 필러 — 솔직 비교', views: '3.2M', likes: '190K', comments: '14K', daysAgo: 3, duration: '18:42', gradient: 'linear-gradient(135deg,#ff4444,#cc0000)', icon: '▶' },
      { type: 'video', caption: 'HIFU 시술 풀 세션 (실제 환자)', views: '2.1M', likes: '124K', comments: '9.8K', daysAgo: 9, duration: '24:15', gradient: 'linear-gradient(135deg,#cc0000,#ff4444)', icon: '▶' },
      { type: 'shorts', caption: '30초만에 보는 리프팅 원리', views: '890K', likes: '67K', comments: '3.4K', daysAgo: 14, duration: '0:45', gradient: 'linear-gradient(135deg,#ff6b6b,#cc0000)', icon: '▶' },
    ],
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
    profileUrl: 'https://www.tiktok.com/@dryoun',
    mediaGrid: [
      { type: 'video', caption: '의사가 추천하는 리프팅 TOP5', views: '7.3M', likes: '980K', comments: '42K', daysAgo: 2, duration: '1:58', gradient: 'linear-gradient(135deg,#6228d7,#9f7aea)', icon: '♪' },
      { type: 'video', caption: '이것만 알면 리프팅 실패 없다', views: '4.8M', likes: '640K', comments: '28K', daysAgo: 6, duration: '2:12', gradient: 'linear-gradient(135deg,#9f7aea,#6228d7)', icon: '♪' },
      { type: 'live', caption: 'LIVE: 성형외과 Q&A 200만뷰', views: '2.1M', likes: '310K', comments: '19K', daysAgo: 11, gradient: 'linear-gradient(135deg,#6228d7,#4c1d95)', icon: '🔴' },
      { type: 'shorts', caption: 'HIFU 전후 60초 타임랩스', views: '1.6M', likes: '210K', comments: '8.9K', daysAgo: 15, duration: '0:59', gradient: 'linear-gradient(135deg,#7c3aed,#6228d7)', icon: '▶' },
    ],
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
    profileUrl: 'https://www.instagram.com/drhyunjin_skin',
    mediaGrid: [
      { type: 'reel', caption: '🇰🇷 한국 최신 리프팅 트렌드', views: '1.8M', likes: '124K', comments: '7.2K', daysAgo: 3, duration: '0:45', gradient: 'linear-gradient(135deg,#002D74,#0084C9)', icon: '▶' },
      { type: 'post', caption: 'VOLNEWMER 실제 효과 비교 (6개월)', views: '420K', likes: '38K', comments: '2.8K', daysAgo: 7, gradient: 'linear-gradient(135deg,#0084C9,#002D74)', icon: '📸' },
      { type: 'reel', caption: 'K-Beauty 리프팅 루틴 공개', views: '960K', likes: '72K', comments: '4.1K', daysAgo: 12, duration: '1:02', gradient: 'linear-gradient(135deg,#002D74,#1e40af)', icon: '▶' },
    ],
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
    profileUrl: 'https://www.instagram.com/dr.tanaka_skin',
    mediaGrid: [
      { type: 'post', caption: 'ピコレーザー vs フラクセル 比較', views: '680K', likes: '52K', comments: '3.1K', daysAgo: 4, gradient: 'linear-gradient(135deg,#0084C9,#0369a1)', icon: '📸' },
      { type: 'reel', caption: 'レーザー治療後のケア方法', views: '310K', likes: '28K', comments: '1.8K', daysAgo: 9, duration: '0:52', gradient: 'linear-gradient(135deg,#0369a1,#0084C9)', icon: '▶' },
      { type: 'post', caption: 'HIFUとRFの違いを解説', views: '240K', likes: '19K', comments: '1.2K', daysAgo: 15, gradient: 'linear-gradient(135deg,#0084C9,#38bdf8)', icon: '📸' },
    ],
  },
]

const CAMPAIGNS = [
  {
    brand: 'Allergan Aesthetics',
    name: '#RealResults',
    platforms: ['instagram', 'tiktok'],
    summary: '글로벌 동시 런칭. 실제 환자 사례 중심 UGC 캠페인. 첫 2주 누적 인상 42M 돌파.',
    kpi: { impressions: '42M', engagement: '6.2%', sentiment: '94% 긍정' },
    color: '#002D74',
    gradient: 'linear-gradient(135deg,#002D74,#0084C9)',
    previewMedia: [
      { type: 'post', caption: '#RealResults — Before & After', metric: '8.4M 노출', gradient: 'linear-gradient(135deg,#002D74,#0369a1)', icon: '📸' },
      { type: 'reel', caption: '실제 환자 UGC 하이라이트', metric: '12.1M 노출', gradient: 'linear-gradient(135deg,#0084C9,#002D74)', icon: '▶' },
      { type: 'video', caption: '글로벌 의사 인터뷰 시리즈', metric: '21.5M 노출', gradient: 'linear-gradient(135deg,#002D74,#1e3a8a)', icon: '🎥' },
    ],
  },
  {
    brand: 'Galderma',
    name: 'Real Doctor Series',
    platforms: ['youtube', 'linkedin'],
    summary: '리얼닥터 콜라보 YouTube 의학 정보 시리즈. 구독자 의료진 신뢰도 기반 전환.',
    kpi: { impressions: '4.2M', engagement: '8.1%', sentiment: '97% 긍정' },
    color: '#0084C9',
    gradient: 'linear-gradient(135deg,#0084C9,#0369a1)',
    previewMedia: [
      { type: 'video', caption: '피부과 의사 직접 Q&A EP01', metric: '1.8M 조회', gradient: 'linear-gradient(135deg,#0084C9,#0ea5e9)', icon: '▶' },
      { type: 'video', caption: 'Real Case — 6개월 추적 관찰', metric: '1.4M 조회', gradient: 'linear-gradient(135deg,#0369a1,#0084C9)', icon: '▶' },
      { type: 'post', caption: 'LinkedIn 전문의 커뮤니티 포스트', metric: '980K 노출', gradient: 'linear-gradient(135deg,#0077b5,#0084C9)', icon: 'in' },
    ],
  },
  {
    brand: 'Merz Aesthetics',
    name: 'Live Q&A Series',
    platforms: ['tiktok', 'instagram'],
    summary: 'TikTok Live 의료진 Q&A 포맷. 경쟁사 대비 참여율 +34%, 팔로워 전환율 업계 최고.',
    kpi: { impressions: '8.9M', engagement: '11.4%', sentiment: '91% 긍정' },
    color: '#6d28d9',
    gradient: 'linear-gradient(135deg,#6d28d9,#9f7aea)',
    previewMedia: [
      { type: 'live', caption: '의사와 실시간 Q&A #1', metric: '2.1M 시청', gradient: 'linear-gradient(135deg,#6d28d9,#7c3aed)', icon: '🔴' },
      { type: 'live', caption: '리프팅 시술 비교 라이브', metric: '1.8M 시청', gradient: 'linear-gradient(135deg,#9f7aea,#6d28d9)', icon: '🔴' },
      { type: 'video', caption: 'Live 하이라이트 편집본', metric: '5.0M 조회', gradient: 'linear-gradient(135deg,#6d28d9,#4c1d95)', icon: '▶' },
    ],
  },
]

const PLATFORM_BADGE: Record<string, { bg: string; text: string; label: string }> = {
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

type MediaType = MediaItem['type']
const MEDIA_TYPE_ICON: Record<MediaType, React.ReactNode> = {
  reel: <Film className="h-3 w-3" />,
  post: <Image className="h-3 w-3" />,
  video: <Play className="h-3 w-3" />,
  shorts: <Play className="h-3 w-3" />,
  live: <span className="text-[8px] font-bold">LIVE</span>,
}

function MediaThumbnail({ item, size = 'sm' }: { item: MediaItem; size?: 'sm' | 'md' }) {
  const h = size === 'md' ? 'h-28' : 'h-20'
  return (
    <div
      className={`relative ${h} w-full rounded-xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.03]`}
      style={{ background: item.gradient }}
    >
      {/* Play overlay for videos */}
      {(item.type === 'video' || item.type === 'reel' || item.type === 'shorts') && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-colors">
            <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}
      {item.type === 'live' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-md bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">● LIVE</div>
        </div>
      )}

      {/* Duration badge */}
      {item.duration && (
        <div className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white font-medium">
          {item.duration}
        </div>
      )}

      {/* Media type badge */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
        {MEDIA_TYPE_ICON[item.type]}
        <span className="ml-0.5 capitalize">{item.type}</span>
      </div>

      {/* Engagement overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="truncate text-[9px] text-white/90 leading-tight">{item.caption}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[8px] text-white/70">
          <span className="flex items-center gap-0.5"><Eye className="h-2 w-2" />{item.views}</span>
          <span className="flex items-center gap-0.5"><Heart className="h-2 w-2" />{item.likes}</span>
        </div>
      </div>
    </div>
  )
}

export default function InfluencerClient() {
  const [activeTab, setActiveTab] = useState<'all' | 'sns' | 'kol' | 'campaign'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-05-06 08:30')
  const [expandedKol, setExpandedKol] = useState<string | null>(null)

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
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
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
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{p.weeklyGrowth}</span>
                  </div>
                  <p className="mb-1 text-sm font-semibold opacity-95">{p.name}</p>
                  <p className="mb-3 text-2xl font-bold">{p.posts.toLocaleString()}<span className="ml-1 text-xs font-normal opacity-70">posts/day</span></p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="opacity-70">평균 참여율</span><span className="font-semibold">{p.avgEngagement}</span></div>
                    <div className="flex justify-between"><span className="opacity-70">Top 해시태그</span><span className="truncate ml-1 font-semibold">{p.topHashtag}</span></div>
                  </div>
                  <div className="mt-3 h-1 w-full rounded-full bg-white/20">
                    <div className="h-1 rounded-full bg-white/80" style={{ width: `${Math.min(100, parseFloat(p.avgEngagement) * 10)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 트렌딩 해시태그 */}
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
              <span className="text-xs text-gray-400">— 썸네일 클릭으로 미디어 피드 확장</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {KOLS.map((kol) => {
                const pb = PLATFORM_BADGE[kol.platform]
                const tb = TREND_BADGE[kol.trend]
                const engNum = parseFloat(kol.engagement)
                const isExpanded = expandedKol === kol.handle

                return (
                  <div key={kol.handle} className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* 프로필 헤더 */}
                    <div className="p-5">
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
                              <a
                                href={kol.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                              >
                                {kol.handle}
                                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                              </a>
                            </div>
                            <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${tb.className}`}>
                              {tb.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 메타 뱃지 */}
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: pb.bg, color: pb.text }}>{pb.label}</span>
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
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, engNum * 8)}%`, background: kol.color }} />
                        </div>
                      </div>

                      {/* 최신 하이라이트 */}
                      <div className="mb-3 rounded-xl p-2.5" style={{ background: `${kol.color}0d` }}>
                        <p className="mb-0.5 text-[10px] font-semibold" style={{ color: kol.color }}>최근 주목 콘텐츠</p>
                        <p className="text-xs leading-relaxed text-gray-700">{kol.recentHighlight}</p>
                      </div>

                      {/* Media grid toggle button */}
                      <button
                        onClick={() => setExpandedKol(isExpanded ? null : kol.handle)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        <Film className="h-3.5 w-3.5" />
                        {isExpanded ? '미디어 숨기기' : `미디어 피드 보기 (${kol.mediaGrid.length})`}
                      </button>
                    </div>

                    {/* Media thumbnail grid (expandable) */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                        <p className="mb-2.5 text-[10px] font-semibold text-gray-400">최근 콘텐츠 미디어</p>
                        <div className={`grid gap-2 ${kol.mediaGrid.length >= 4 ? 'grid-cols-2' : 'grid-cols-' + kol.mediaGrid.length}`}>
                          {kol.mediaGrid.map((item, i) => (
                            <MediaThumbnail key={i} item={item} size="sm" />
                          ))}
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {kol.mediaGrid.map((item, i) => (
                            <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Eye className="h-2.5 w-2.5" />
                              <span className="font-medium text-gray-700">{item.views}</span>
                              <Heart className="h-2.5 w-2.5 ml-1" />
                              <span className="font-medium text-gray-700">{item.likes}</span>
                              {i < kol.mediaGrid.length - 1 && <span className="ml-1 text-gray-300">·</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

            <div className="space-y-5">
              {CAMPAIGNS.map((c, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  {/* Campaign header */}
                  <div className="flex items-start gap-4 p-5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow"
                      style={{ background: c.color }}
                    >
                      {c.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: '#2C3E50' }}>{c.brand}</p>
                        <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: c.color }}>
                          {c.name}
                        </span>
                      </div>
                      <div className="mb-2 flex gap-1.5">
                        {c.platforms.map((pl) => {
                          const pb = PLATFORM_BADGE[pl]
                          return (
                            <span key={pl} className="rounded-lg px-2 py-0.5 text-xs font-medium" style={{ background: pb.bg, color: pb.text }}>
                              {pb.label}
                            </span>
                          )
                        })}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">{c.summary}</p>
                    </div>

                    {/* KPI */}
                    <div className="shrink-0 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-0.5"><Eye className="h-3 w-3" /><span>노출</span></div>
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{c.kpi.impressions}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-0.5"><Heart className="h-3 w-3" /><span>참여율</span></div>
                        <p className="text-sm font-bold" style={{ color: '#002D74' }}>{c.kpi.engagement}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-0.5"><MessageCircle className="h-3 w-3" /><span>감성</span></div>
                        <p className="text-sm font-bold text-emerald-600">{c.kpi.sentiment}</p>
                      </div>
                    </div>
                  </div>

                  {/* Campaign media preview */}
                  <div className="border-t border-gray-50 px-5 pb-5">
                    <p className="mb-2.5 text-[11px] font-semibold text-gray-400">캠페인 미디어 프리뷰</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {c.previewMedia.map((media, mi) => (
                        <div
                          key={mi}
                          className="relative h-28 rounded-xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
                          style={{ background: media.gradient }}
                        >
                          {(media.icon === '▶' || media.icon === '🎥') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm group-hover:bg-white/35">
                                <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                              </div>
                            </div>
                          )}
                          {media.icon === '🔴' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-md bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">● LIVE</div>
                            </div>
                          )}
                          {media.icon === 'in' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white opacity-60">in</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="truncate text-[9px] text-white/90">{media.caption}</p>
                            <p className="text-[9px] font-semibold text-white/70">{media.metric}</p>
                          </div>
                        </div>
                      ))}
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
