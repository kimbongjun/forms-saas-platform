'use client'

import { useState } from 'react'
import {
  Clock,
  ExternalLink,
  Eye,
  Film,
  Flame,
  Heart,
  ImageIcon,
  MessageCircle,
  Play,
  RefreshCw,
  Users,
  X,
} from 'lucide-react'
import MarketNav from './MarketNav'

type PlatformKey = 'instagram' | 'tiktok' | 'youtube' | 'linkedin'
type TabKey = 'all' | 'sns' | 'kol' | 'campaign'
type MediaType = 'video' | 'reel' | 'post' | 'shorts' | 'live'

type CampaignMedia = {
  type: MediaType
  title: string
  metric: string
  platform: PlatformKey
  thumbnailUrl?: string
  detailUrl: string
  embedUrl?: string
  duration?: string
  brandColor: string
}

type Campaign = {
  brand: string
  name: string
  summary: string
  insight: string
  platforms: PlatformKey[]
  detailUrl: string
  sourceLabel: string
  kpi: {
    impressions: string
    engagement: string
    sentiment: string
  }
  media: CampaignMedia[]
}

type KOL = {
  name: string
  handle: string
  platform: PlatformKey
  specialty: string
  country: string
  followers: string
  engagement: string
  summary: string
  profileUrl: string
}

const LAST_UPDATED = '2026-05-06 08:30'

const PLATFORM_META: Record<PlatformKey, { label: string; bg: string; text: string }> = {
  instagram: { label: 'IG', bg: '#fdf2f8', text: '#be185d' },
  tiktok: { label: 'TK', bg: '#ecfeff', text: '#155e75' },
  youtube: { label: 'YT', bg: '#fef2f2', text: '#b91c1c' },
  linkedin: { label: 'LI', bg: '#eff6ff', text: '#1d4ed8' },
}

const SNS_OVERVIEW = [
  { name: 'Instagram', platform: 'instagram' as const, postsPerDay: '2,840', engagement: '4.8%', growth: '+12.4%' },
  { name: 'TikTok', platform: 'tiktok' as const, postsPerDay: '6,710', engagement: '8.5%', growth: '+34.1%' },
  { name: 'YouTube', platform: 'youtube' as const, postsPerDay: '412', engagement: '6.9%', growth: '+8.7%' },
  { name: 'LinkedIn', platform: 'linkedin' as const, postsPerDay: '1,230', engagement: '3.1%', growth: '+21.3%' },
]

const KOLS: KOL[] = [
  {
    name: 'Dr. Shereene Idriss',
    handle: '@shereeneidriss',
    platform: 'instagram',
    specialty: 'Dermatologist',
    country: 'USA',
    followers: '1.24M',
    engagement: '5.8%',
    summary: '의사 본인 출연형 리프팅 리뷰 콘텐츠가 여전히 강합니다.',
    profileUrl: 'https://www.instagram.com/shereeneidriss/',
  },
  {
    name: 'Dr. Muneeb Shah',
    handle: '@dermdoctor',
    platform: 'tiktok',
    specialty: 'Dermatologist / Educator',
    country: 'USA',
    followers: '12.8M',
    engagement: '9.2%',
    summary: '짧은 비교형 영상으로 RF/HIFU 콘텐츠 반응을 키우는 대표 채널입니다.',
    profileUrl: 'https://www.tiktok.com/@dermdoctor',
  },
  {
    name: 'Dr. Hyunjin Park',
    handle: '@drhyunjin_skin',
    platform: 'instagram',
    specialty: 'K-Beauty Clinic',
    country: 'Korea',
    followers: '890K',
    engagement: '6.9%',
    summary: '국내 리프팅 시술 후기와 케이스형 숏폼에 강합니다.',
    profileUrl: 'https://www.instagram.com/drhyunjin_skin/',
  },
  {
    name: 'Dr. Sandra Lee',
    handle: '@drpimplepopper',
    platform: 'youtube',
    specialty: 'Dermatology Media',
    country: 'USA',
    followers: '7.41M',
    engagement: '6.3%',
    summary: '긴 영상 기반 브랜드 협업과 설명형 포맷 파급력이 큽니다.',
    profileUrl: 'https://www.youtube.com/@DrPimplePopper',
  },
]

const CAMPAIGNS: Campaign[] = [
  {
    brand: 'Allergan Aesthetics',
    name: '#RealResults',
    summary: '실제 환자 결과 중심의 UGC 포맷으로 Instagram과 TikTok을 동시에 운용하는 캠페인입니다.',
    insight: '시술 전후 결과와 의사 멘트를 같이 노출해 신뢰도와 확산력을 동시에 확보한 구조입니다.',
    detailUrl: 'https://www.allerganaesthetics.com/newsroom',
    sourceLabel: 'Allergan Newsroom',
    platforms: ['instagram', 'tiktok'],
    kpi: { impressions: '42M', engagement: '6.2%', sentiment: '94% positive' },
    media: [
      {
        type: 'post',
        title: 'Before & After carousel',
        metric: '8.4M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.allerganaesthetics.com/newsroom',
        brandColor: '#0f4c81',
      },
      {
        type: 'reel',
        title: 'Patient story short-form',
        metric: '12.1M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/allerganaesthetics/',
        brandColor: '#0284c7',
      },
      {
        type: 'video',
        title: 'Doctor testimonial highlight',
        metric: '21.5M impressions',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@AllerganAesthetics',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        duration: '1:42',
        brandColor: '#1d4ed8',
      },
    ],
  },
  {
    brand: 'Galderma',
    name: 'Real Doctor Series',
    summary: '의사 Q&A와 시술 케이스를 YouTube 장편 영상과 LinkedIn 요약 포스트로 연결한 포맷입니다.',
    insight: '전문가 신뢰를 앞세우고 장편 설명형 영상으로 교육 가치까지 챙기는 점이 강점입니다.',
    detailUrl: 'https://www.galderma.com/news',
    sourceLabel: 'Galderma News',
    platforms: ['youtube', 'linkedin'],
    kpi: { impressions: '4.2M', engagement: '8.1%', sentiment: '97% positive' },
    media: [
      {
        type: 'video',
        title: 'Doctor Q&A episode',
        metric: '1.8M views',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@Galderma',
        embedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
        thumbnailUrl: 'https://i.ytimg.com/vi/ysz5S6PUM-U/hqdefault.jpg',
        duration: '3:12',
        brandColor: '#0891b2',
      },
      {
        type: 'video',
        title: '6-month real case review',
        metric: '1.4M views',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@Galderma',
        embedUrl: 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
        thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
        duration: '2:08',
        brandColor: '#0369a1',
      },
      {
        type: 'post',
        title: 'LinkedIn medical summary',
        metric: '980K impressions',
        platform: 'linkedin',
        detailUrl: 'https://www.linkedin.com/company/galderma/',
        brandColor: '#1d4ed8',
      },
    ],
  },
  {
    brand: 'Merz Aesthetics',
    name: 'Live Q&A Series',
    summary: 'TikTok Live와 Instagram 클립을 묶어 질문 수집, 실시간 상담, 재편집 재배포까지 이어지는 구조입니다.',
    insight: '라이브 원본, 숏폼 재가공, 랜딩 전환까지 연결되는 퍼널 설계가 매우 명확합니다.',
    detailUrl: 'https://www.merz-aesthetics.com/',
    sourceLabel: 'Merz Aesthetics',
    platforms: ['tiktok', 'instagram'],
    kpi: { impressions: '8.9M', engagement: '11.4%', sentiment: '91% positive' },
    media: [
      {
        type: 'live',
        title: 'Doctor live Q&A',
        metric: '2.1M live views',
        platform: 'tiktok',
        detailUrl: 'https://www.tiktok.com/',
        brandColor: '#7c3aed',
      },
      {
        type: 'reel',
        title: 'Live highlight cut',
        metric: '5.0M views',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/merzaesthetics/',
        brandColor: '#9333ea',
      },
      {
        type: 'video',
        title: 'Ultherapy education clip',
        metric: '1.7M views',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/results?search_query=merz+aesthetics+ultherapy',
        embedUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
        thumbnailUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
        duration: '2:34',
        brandColor: '#6d28d9',
      },
    ],
  },
]

function MediaBadge({ platform }: { platform: PlatformKey }) {
  const meta = PLATFORM_META[platform]
  return (
    <span className="rounded-lg px-2 py-0.5 text-[11px] font-semibold" style={{ background: meta.bg, color: meta.text }}>
      {meta.label}
    </span>
  )
}

function MediaTypeIcon({ type }: { type: MediaType }) {
  if (type === 'post') return <ImageIcon className="h-3 w-3" />
  if (type === 'live') return <span className="text-[9px] font-bold">LIVE</span>
  return <Play className="h-3 w-3" />
}

function MediaThumbnail({
  media,
  onOpen,
}: {
  media: CampaignMedia
  onOpen: (media: CampaignMedia) => void
}) {
  return (
    <button
      onClick={() => onOpen(media)}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-950 text-left"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${media.brandColor} 0%, #111827 100%)`,
        }}
      />
      {media.thumbnailUrl ? (
        <img
          src={media.thumbnailUrl}
          alt={media.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="relative flex h-44 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/45 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <MediaTypeIcon type={media.type} />
            <span className="capitalize">{media.type}</span>
          </span>
          <MediaBadge platform={media.platform} />
        </div>

        {(media.type === 'video' || media.type === 'reel' || media.type === 'shorts') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-white/30">
              <Play className="ml-0.5 h-5 w-5 text-white" fill="white" />
            </div>
          </div>
        )}

        {media.type === 'live' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-md bg-red-500/90 px-2.5 py-1 text-[10px] font-bold text-white">LIVE</div>
          </div>
        )}

        <div className="relative mt-auto">
          <p className="line-clamp-2 text-sm font-semibold text-white">{media.title}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-white/75">{media.metric}</p>
            {media.duration ? <span className="text-[11px] text-white/75">{media.duration}</span> : null}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function InfluencerClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED)
  const [selectedMedia, setSelectedMedia] = useState<CampaignMedia | null>(null)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const now = new Date()
    setLastUpdated(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setRefreshing(false)
  }

  const showSns = activeTab === 'all' || activeTab === 'sns'
  const showKol = activeTab === 'all' || activeTab === 'kol'
  const showCampaign = activeTab === 'all' || activeTab === 'campaign'

  return (
    <div className="min-h-full bg-white">
      <MarketNav />

      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Marketing</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Marketing & KOL Intelligence</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              캠페인 벤치마크, SNS 트렌드, 글로벌 KOL 채널을 한 화면에서 비교합니다.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
        <div className="flex flex-wrap gap-2">
          {([
            ['all', '전체 보기'],
            ['sns', 'SNS 피드'],
            ['kol', 'KOL 분석'],
            ['campaign', '캠페인'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                activeTab === key
                  ? 'bg-[#002D74] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-6">
        {showSns && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <h2 className="text-base font-bold text-gray-900">SNS 트렌드 스냅샷</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {SNS_OVERVIEW.map((item) => (
                <div key={item.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <MediaBadge platform={item.platform} />
                  </div>
                  <p className="text-2xl font-bold text-[#002D74]">{item.postsPerDay}</p>
                  <p className="mt-0.5 text-xs text-gray-400">posts / day</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Engagement</p>
                      <p className="mt-0.5 font-semibold text-gray-800">{item.engagement}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Growth</p>
                      <p className="mt-0.5 font-semibold text-emerald-600">{item.growth}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showKol && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-bold text-gray-900">KOL Watch List</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {KOLS.map((kol) => {
                const meta = PLATFORM_META[kol.platform]
                return (
                  <article key={kol.handle} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{kol.name}</h3>
                        <a
                          href={kol.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          {kol.handle}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <span className="rounded-lg px-2 py-0.5 text-[11px] font-semibold" style={{ background: meta.bg, color: meta.text }}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3 text-center">
                        <p className="text-sm font-bold text-[#002D74]">{kol.followers}</p>
                        <p className="text-[10px] text-gray-400">Followers</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 text-center">
                        <p className="text-sm font-bold text-[#002D74]">{kol.engagement}</p>
                        <p className="text-[10px] text-gray-400">Engagement</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 text-center">
                        <p className="text-sm font-bold text-[#002D74]">{kol.country}</p>
                        <p className="text-[10px] text-gray-400">Market</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600">{kol.specialty}</span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600">{kol.country}</span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-gray-600">{kol.summary}</p>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {showCampaign && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Film className="h-5 w-5 text-[#002D74]" />
              <h2 className="text-base font-bold text-gray-900">Campaign Benchmark</h2>
              <span className="text-xs text-gray-400">썸네일, 상세 링크, 영상 미리보기를 포함합니다.</span>
            </div>

            <div className="space-y-5">
              {CAMPAIGNS.map((campaign) => (
                <article key={campaign.name} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{campaign.brand}</h3>
                          <span className="rounded-full bg-[#002D74] px-3 py-1 text-xs font-semibold text-white">
                            {campaign.name}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {campaign.platforms.map((platform) => (
                            <MediaBadge key={platform} platform={platform} />
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">{campaign.summary}</p>
                        <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Why it matters</p>
                          <p className="mt-1 text-sm text-blue-900">{campaign.insight}</p>
                        </div>
                      </div>

                      <div className="grid shrink-0 grid-cols-3 gap-3 xl:min-w-[310px]">
                        <div className="rounded-2xl bg-gray-50 p-3 text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-gray-400">
                            <Eye className="h-3 w-3" />
                            Impressions
                          </div>
                          <p className="text-sm font-bold text-[#002D74]">{campaign.kpi.impressions}</p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-3 text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-gray-400">
                            <Heart className="h-3 w-3" />
                            Engagement
                          </div>
                          <p className="text-sm font-bold text-[#002D74]">{campaign.kpi.engagement}</p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-3 text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-gray-400">
                            <MessageCircle className="h-3 w-3" />
                            Sentiment
                          </div>
                          <p className="text-sm font-bold text-emerald-600">{campaign.kpi.sentiment}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={campaign.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        캠페인 상세 보기
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href={campaign.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        소스: {campaign.sourceLabel}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Media preview</p>
                      <p className="text-xs text-gray-400">카드를 누르면 모달 재생 또는 외부 링크로 이동합니다.</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {campaign.media.map((media) => (
                        <div key={`${campaign.name}-${media.title}`} className="space-y-2">
                          <MediaThumbnail media={media} onOpen={setSelectedMedia} />
                          <div className="flex items-center justify-between gap-2 px-1">
                            <span className="text-xs text-gray-500">{media.metric}</span>
                            <a
                              href={media.detailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                              상세 링크
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedMedia ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedMedia.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{selectedMedia.metric}</p>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {selectedMedia.embedUrl ? (
                <div className="overflow-hidden rounded-2xl bg-black">
                  <div className="relative aspect-video">
                    <iframe
                      src={selectedMedia.embedUrl}
                      title={selectedMedia.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="flex aspect-video items-center justify-center rounded-2xl text-white"
                  style={{ background: `linear-gradient(135deg, ${selectedMedia.brandColor} 0%, #111827 100%)` }}
                >
                  <div className="text-center">
                    <p className="text-lg font-semibold">{selectedMedia.title}</p>
                    <p className="mt-2 text-sm text-white/80">외부 플랫폼 상세 링크로 이동해 확인하세요.</p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={selectedMedia.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#002D74] px-4 py-2 text-sm font-medium text-white hover:bg-[#001f4f]"
                >
                  원본 상세 링크 열기
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
