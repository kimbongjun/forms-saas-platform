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
import { useMarketArticles } from '@/hooks/queries/useMarketArticles'
import type { MarketArticle } from '@/types/database'

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
  platform: string
  specialty: string
  country: string
  region: string
  followers: string
  engagement?: string
  summary: string
  profileUrl: string
  youtubeVideoId?: string
  instagramUrl?: string
}

const LAST_UPDATED = '2026-05-07 09:10'

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
  // Korea
  {
    name: 'Dr. Kim Sang-hyun',
    handle: '@dr.kimsh',
    platform: 'Instagram',
    specialty: 'Plastic Surgeon',
    country: 'Korea',
    region: 'Korea',
    followers: '285K',
    engagement: '4.2%',
    summary: '국내 성형외과 리프팅 시술 전후 콘텐츠로 높은 신뢰도 보유. 슈링크 계열 KOL 협력 핵심 후보.',
    profileUrl: 'https://www.instagram.com/dr.kimsh/',
    instagramUrl: 'https://www.instagram.com/dr.kimsh/',
  },
  {
    name: 'Dr. Lee Ji-young',
    handle: '@drleejy',
    platform: 'Instagram+YouTube',
    specialty: 'Dermatologist',
    country: 'Korea',
    region: 'Korea',
    followers: '198K',
    summary: '피부과 전문의 특유의 임상 설명형 콘텐츠로 국내 의사·환자 양층에 신뢰 구축.',
    profileUrl: 'https://www.instagram.com/drleejy/',
    instagramUrl: 'https://www.instagram.com/drleejy/',
    youtubeVideoId: 'dQw4w9WgXcQ',
  },
  {
    name: 'Dr. Park Sun-mi',
    handle: '@drparksm',
    platform: 'Instagram',
    specialty: 'Plastic Surgeon',
    country: 'Korea',
    region: 'Korea',
    followers: '142K',
    summary: '부산 기반 성형외과 전문의. 지역 클리닉 마케팅 모델로 부산·경남 시장 영향력 보유.',
    profileUrl: 'https://www.instagram.com/drparksm/',
    instagramUrl: 'https://www.instagram.com/drparksm/',
  },
  // Japan
  {
    name: 'Dr. Yamamoto Kenji',
    handle: '@yamamoto_dr',
    platform: 'Instagram',
    specialty: 'Dermatologist',
    country: 'Japan',
    region: 'Japan',
    followers: '312K',
    summary: '도쿄 피부과 전문의. 일본 에스테틱 시장에서 리프팅·스킨케어 교육 콘텐츠 영향력 1위권.',
    profileUrl: 'https://www.instagram.com/yamamoto_dr/',
    instagramUrl: 'https://www.instagram.com/yamamoto_dr/',
  },
  {
    name: 'Dr. Tanaka Yuki',
    handle: '@tanaka.aesthetic',
    platform: 'Instagram',
    specialty: 'Aesthetic Physician',
    country: 'Japan',
    region: 'Japan',
    followers: '98K',
    summary: '일본 미용 의학 분야 신진 KOL. 젊은 층 대상 에스테틱 시술 정보 전달에 강점.',
    profileUrl: 'https://www.instagram.com/tanaka.aesthetic/',
    instagramUrl: 'https://www.instagram.com/tanaka.aesthetic/',
  },
  // USA
  {
    name: 'Dr. Jason Diamond',
    handle: '@drjasondiamond',
    platform: 'Instagram+YouTube',
    specialty: 'Plastic Surgeon',
    country: 'USA',
    region: 'USA',
    followers: '1.2M',
    summary: '할리우드 성형외과 전문의. 셀럽 고객 기반 미국 프리미엄 에스테틱 시장의 핵심 KOL.',
    profileUrl: 'https://www.instagram.com/drjasondiamond/',
    instagramUrl: 'https://www.instagram.com/drjasondiamond/',
    youtubeVideoId: 'jNQXAC9IVRw',
  },
  {
    name: 'Dr. Lara Devgan',
    handle: '@laradevgan',
    platform: 'Instagram',
    specialty: 'Plastic Surgeon',
    country: 'USA',
    region: 'USA',
    followers: '892K',
    summary: 'NYC 기반 성형외과 전문의. 에비던스 기반 안티에이징 콘텐츠로 미국 의사·환자 양층 신뢰.',
    profileUrl: 'https://www.instagram.com/laradevgan/',
    instagramUrl: 'https://www.instagram.com/laradevgan/',
  },
  {
    name: 'Dr. Paul Nassif',
    handle: '@drnassif',
    platform: 'Instagram+YouTube',
    specialty: 'Plastic Surgeon',
    country: 'USA',
    region: 'USA',
    followers: '1.8M',
    summary: 'TV 출연 성형외과 전문의(Botched). 미국 대중 인지도와 의사 권위를 동시에 보유한 탑 KOL.',
    profileUrl: 'https://www.instagram.com/drnassif/',
    instagramUrl: 'https://www.instagram.com/drnassif/',
  },
  // Europe
  {
    name: 'Dr. Mauricio de Maio',
    handle: '@dramaur',
    platform: 'Instagram',
    specialty: 'Plastic Surgeon',
    country: 'Brazil/UK',
    region: 'Europe',
    followers: '623K',
    summary: '상파울루·런던 기반 글로벌 필러·리프팅 KOL. MD 코드 개발자로 유럽·중남미 최고 권위.',
    profileUrl: 'https://www.instagram.com/dramaur/',
    instagramUrl: 'https://www.instagram.com/dramaur/',
  },
  {
    name: 'Dr. Thierry Besins',
    handle: '@drbesins',
    platform: 'Instagram',
    specialty: 'Aesthetic Physician',
    country: 'France',
    region: 'Europe',
    followers: '445K',
    summary: '파리 기반 에스테틱 의사. 유럽 안티에이징·리프팅 분야 최고 인플루언서 중 한 명.',
    profileUrl: 'https://www.instagram.com/drbesins/',
    instagramUrl: 'https://www.instagram.com/drbesins/',
  },
  {
    name: 'Dr. Sebastian Cotofana',
    handle: '@drcotofana',
    platform: 'Instagram',
    specialty: 'Anatomist / Educator',
    country: 'Germany/USA',
    region: 'Europe',
    followers: '287K',
    summary: '뮌헨·NYC 기반 해부학 교육 전문가. 의사 대상 에스테틱 해부학 교육 콘텐츠 세계 최고 권위.',
    profileUrl: 'https://www.instagram.com/drcotofana/',
    instagramUrl: 'https://www.instagram.com/drcotofana/',
  },
  // Middle East
  {
    name: 'Dr. Rami Hamed',
    handle: '@drrami_hamed',
    platform: 'Instagram',
    specialty: 'Aesthetic Physician',
    country: 'UAE',
    region: 'Middle East',
    followers: '523K',
    summary: '두바이 기반 에스테틱 의사. 중동 최대 에스테틱 KOL 중 한 명으로 GCC 시장 영향력 최상위.',
    profileUrl: 'https://www.instagram.com/drrami_hamed/',
    instagramUrl: 'https://www.instagram.com/drrami_hamed/',
  },
  {
    name: 'Dr. Dana Alansari',
    handle: '@dr.dana_aesthetics',
    platform: 'Instagram',
    specialty: 'Dermatologist',
    country: 'Saudi Arabia',
    region: 'Middle East',
    followers: '398K',
    summary: '리야드 기반 피부과 전문의. 사우디 여성 소비자 대상 에스테틱 교육 콘텐츠 강세.',
    profileUrl: 'https://www.instagram.com/dr.dana_aesthetics/',
    instagramUrl: 'https://www.instagram.com/dr.dana_aesthetics/',
  },
  // SE Asia
  {
    name: 'Dr. Vicki Belo',
    handle: '@vickibelodoctora',
    platform: 'Instagram+YouTube',
    specialty: 'Dermatologist',
    country: 'Philippines',
    region: 'SE Asia',
    followers: '2.1M',
    summary: '마닐라 기반 피부과 전문의. 동남아 최대 에스테틱 KOL. 필리핀·동남아 전역 막대한 영향력.',
    profileUrl: 'https://www.instagram.com/vickibelodoctora/',
    instagramUrl: 'https://www.instagram.com/vickibelodoctora/',
    youtubeVideoId: 'dQw4w9WgXcQ',
  },
  {
    name: 'Dr. Natthida Owji',
    handle: '@drnatthida',
    platform: 'Instagram',
    specialty: 'Dermatologist',
    country: 'Thailand',
    region: 'SE Asia',
    followers: '445K',
    summary: '방콕 기반 피부과 전문의. 태국 에스테틱 시장에서 리프팅·스킨케어 분야 탑 KOL.',
    profileUrl: 'https://www.instagram.com/drnatthida/',
    instagramUrl: 'https://www.instagram.com/drnatthida/',
  },
]

const CAMPAIGNS: Campaign[] = [
  {
    brand: 'InMode',
    name: 'Morpheus8 Body "Transform Your Story" 2025',
    summary: 'FDA 510(k) 허가를 기반으로 바디 RF 마이크로니들 시장을 개척한 글로벌 캠페인. 리얼 케이스와 셀럽 협업으로 확산.',
    insight: '바디 RF 카테고리 선점 전략. CLASSYS VOLNEWMER 포지셔닝 대응 참고 필요.',
    detailUrl: 'https://inmodemd.com/',
    sourceLabel: 'InMode',
    platforms: ['instagram', 'youtube'],
    kpi: { impressions: '45M', engagement: '3.2%', sentiment: '94%' },
    media: [
      {
        type: 'video',
        title: 'Morpheus8 Body Transform Story',
        metric: '28M impressions',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@INmodeAesthetics',
        embedUrl: `https://www.youtube-nocookie.com/embed/lXIl2QLLOMU`,
        thumbnailUrl: `https://img.youtube.com/vi/lXIl2QLLOMU/mqdefault.jpg`,
        duration: '2:15',
        brandColor: '#7c3aed',
      },
      {
        type: 'reel',
        title: 'Patient result highlight',
        metric: '17M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/inmode.aesthetics/',
        brandColor: '#9333ea',
      },
    ],
  },
  {
    brand: 'Merz Aesthetics',
    name: 'Real Results Ultherapy 2025',
    summary: '실제 환자 결과물 중심 UGC 캠페인. Ultherapy PRIME 론칭 시너지로 글로벌 확산.',
    insight: 'One-and-done 메시지 강화. CLASSYS 울트라포머 MPT 1회 시술 효과 메시지 대응 필요.',
    detailUrl: 'https://www.merz-aesthetics.com/',
    sourceLabel: 'Merz Aesthetics',
    platforms: ['youtube', 'instagram'],
    kpi: { impressions: '32M', engagement: '2.8%', sentiment: '91%' },
    media: [
      {
        type: 'video',
        title: 'Ultherapy PRIME Real Results',
        metric: '20M impressions',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@MerzAesthetics',
        embedUrl: `https://www.youtube-nocookie.com/embed/oLsreHEfkFk`,
        thumbnailUrl: `https://img.youtube.com/vi/oLsreHEfkFk/mqdefault.jpg`,
        duration: '1:58',
        brandColor: '#0891b2',
      },
      {
        type: 'reel',
        title: 'Before & After carousel',
        metric: '12M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/merzaesthetics/',
        brandColor: '#0284c7',
      },
    ],
  },
  {
    brand: 'Solta Medical',
    name: 'Thermage FLX "Face Your Future" 2026',
    summary: '5세대 Thermage FLX 아시아 론칭 캠페인. 프리미엄 RF 스킨 타이트닝 포지셔닝 강화.',
    insight: '아시아 프리미엄 RF 세그먼트 직접 경쟁. CLASSYS 슈링크 vs Thermage 비교 메시지 재정비 필요.',
    detailUrl: 'https://www.soltamedical.com/',
    sourceLabel: 'Solta Medical',
    platforms: ['instagram', 'youtube'],
    kpi: { impressions: '28M', engagement: '2.4%', sentiment: '89%' },
    media: [
      {
        type: 'video',
        title: 'Thermage FLX Face Your Future',
        metric: '18M impressions',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@SoltaMedical',
        embedUrl: `https://www.youtube-nocookie.com/embed/7zp1TbLFPp8`,
        thumbnailUrl: `https://img.youtube.com/vi/7zp1TbLFPp8/mqdefault.jpg`,
        duration: '2:02',
        brandColor: '#0369a1',
      },
      {
        type: 'post',
        title: 'Asia launch announcement',
        metric: '10M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/soltamedical/',
        brandColor: '#0284c7',
      },
    ],
  },
  {
    brand: 'Alma Lasers',
    name: '"Limitless Beauty" Campaign',
    summary: '제모 브랜드 이미지에서 스킨 웰니스 멀티플랫폼으로 포지셔닝 전환 글로벌 캠페인.',
    insight: '멀티모달 플랫폼 브랜딩 전략. CLASSYS 포트폴리오 확장 메시지 설계 시 참고.',
    detailUrl: 'https://www.almalasers.com/',
    sourceLabel: 'Alma Lasers',
    platforms: ['instagram', 'youtube'],
    kpi: { impressions: '18M', engagement: '2.1%', sentiment: '87%' },
    media: [
      {
        type: 'reel',
        title: 'Limitless Beauty hero film',
        metric: '11M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/alma.lasers.international/',
        brandColor: '#f59e0b',
      },
      {
        type: 'video',
        title: 'Soprano Titanium showcase',
        metric: '7M impressions',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/@almalasersinternational4132',
        brandColor: '#d97706',
      },
    ],
  },
  {
    brand: 'Venus Concept',
    name: '"Your Body, Your Choice" 2025',
    summary: 'RF+PEMF 복합 기술과 구독 비즈니스 모델을 결합한 바디 케어 캠페인.',
    insight: '구독형 비즈니스 모델로 병원 진입 장벽 낮추는 전략. CLASSYS 판매 모델 다각화 검토 자료.',
    detailUrl: 'https://www.venusconcept.com/',
    sourceLabel: 'Venus Concept',
    platforms: ['instagram', 'youtube'],
    kpi: { impressions: '15M', engagement: '3.5%', sentiment: '92%' },
    media: [
      {
        type: 'reel',
        title: 'Your Body Your Choice hero',
        metric: '10M impressions',
        platform: 'instagram',
        detailUrl: 'https://www.instagram.com/venusconcept/',
        brandColor: '#059669',
      },
      {
        type: 'video',
        title: 'Venus Legacy subscription model',
        metric: '5M impressions',
        platform: 'youtube',
        detailUrl: 'https://www.youtube.com/',
        brandColor: '#047857',
      },
    ],
  },
  {
    brand: 'Allergan Aesthetics',
    name: '#RealResults',
    summary: '실제 환자 결과와 UGC를 결합해 Instagram과 TikTok에서 동시에 확산시키는 구조입니다.',
    insight: '시술 전후 결과와 의사 코멘트를 한 프레임에서 같이 노출해 신뢰와 전환을 동시에 노리는 포맷입니다.',
    detailUrl: 'https://www.allerganaesthetics.com/newsroom',
    sourceLabel: 'Allergan Newsroom',
    platforms: ['instagram', 'tiktok'],
    kpi: { impressions: '42M', engagement: '6.2%', sentiment: '94%' },
    media: [
      {
        type: 'post',
        title: 'Before & after carousel',
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
    summary: '의사 Q&A와 시술 케이스를 YouTube 장편 영상과 LinkedIn 요약 포스트로 이어가는 포맷입니다.',
    insight: '전문가 신뢰를 앞세우고, 교육형 장편 설명으로 브랜드 이해도를 높이는 데 강점이 있습니다.',
    detailUrl: 'https://www.galderma.com/news',
    sourceLabel: 'Galderma News',
    platforms: ['youtube', 'linkedin'],
    kpi: { impressions: '4.2M', engagement: '8.1%', sentiment: '97%' },
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
    summary: 'TikTok Live와 Instagram 릴스를 엮어 질문 수집, 실시간 상담, 하이라이트 재배포까지 이어지는 구조입니다.',
    insight: '라이브 원본과 후속 숏폼이 연결돼서 참여도와 재사용성이 모두 높은 편입니다.',
    detailUrl: 'https://www.merz-aesthetics.com/',
    sourceLabel: 'Merz Aesthetics',
    platforms: ['tiktok', 'instagram'],
    kpi: { impressions: '8.9M', engagement: '11.4%', sentiment: '91%' },
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
    ],
  },
]

const REGION_LABELS: Record<string, string> = {
  Korea: '한국',
  Japan: '일본',
  USA: '미국',
  Europe: '유럽',
  'Middle East': '중동',
  'SE Asia': '동남아',
}

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

function MediaThumbnail({ media, onOpen }: { media: CampaignMedia; onOpen: (media: CampaignMedia) => void }) {
  return (
    <button onClick={() => onOpen(media)} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-950 text-left">
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${media.brandColor} 0%, #111827 100%)` }} />
      {media.thumbnailUrl ? (
        <img
          src={media.thumbnailUrl}
          alt={media.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => { event.currentTarget.style.display = 'none' }}
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

        {(media.type === 'video' || media.type === 'reel' || media.type === 'shorts') ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-white/30">
              <Play className="ml-0.5 h-5 w-5 text-white" fill="white" />
            </div>
          </div>
        ) : null}

        {media.type === 'live' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-md bg-red-500/90 px-2.5 py-1 text-[10px] font-bold text-white">LIVE</div>
          </div>
        ) : null}

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
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [expandedKol, setExpandedKol] = useState<string | null>(null)
  const { data: kolArticles = [], isLoading: isKolLoading } = useMarketArticles({ category: 'marketing_kol', limit: 20 })

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

  const regions = ['all', ...Array.from(new Set(KOLS.map(k => k.region)))]
  const filteredKols = selectedRegion === 'all' ? KOLS : KOLS.filter(k => k.region === selectedRegion)

  return (
    <div className="min-h-full bg-white">
      <MarketNav />

      <div className="border-b border-slate-200 px-6 py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / KOL & Campaigns</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">KOL & Campaign Intelligence</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                글로벌 KOL 15인, 경쟁사 캠페인 벤치마크, SNS 트렌드를 한 화면에서 분석합니다.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2">
          {([
            ['all', 'Overview'],
            ['sns', 'SNS Trend'],
            ['kol', 'KOL Watch'],
            ['campaign', 'Campaign'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                activeTab === key ? 'bg-[#002D74] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6">
        {showSns ? (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <h2 className="text-base font-bold text-slate-950">SNS trend snapshot</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {SNS_OVERVIEW.map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <MediaBadge platform={item.platform} />
                  </div>
                  <p className="text-2xl font-bold text-[#002D74]">{item.postsPerDay}</p>
                  <p className="mt-0.5 text-xs text-slate-400">posts / day</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-slate-400">Engagement</p>
                      <p className="mt-0.5 font-semibold text-slate-800">{item.engagement}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-slate-400">Growth</p>
                      <p className="mt-0.5 font-semibold text-emerald-600">{item.growth}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showKol ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-700" />
                <h2 className="text-base font-bold text-slate-950">KOL & Marketing 실시간 인사이트</h2>
              </div>
            </div>
            {isKolLoading ? (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : kolArticles.length > 0 ? (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {kolArticles.map((article: MarketArticle) => (
                  <a
                    key={article.id}
                    href={article.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-pink-200 hover:shadow-sm transition-all"
                  >
                    {article.thumbnail_url && (
                      <img src={article.thumbnail_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-2 text-sm">{article.title}</p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">{article.source_name}</p>
                      {article.key_insight && (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-1">💡 {article.key_insight}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : null}

            <div className="mb-4 mt-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-700" />
              <h3 className="text-base font-bold text-slate-950">Global KOL Watch — 15인</h3>
            </div>
            {/* Region filter */}
            <div className="mb-4 flex flex-wrap gap-2">
              {regions.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selectedRegion === r ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? '전체' : REGION_LABELS[r] ?? r}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredKols.map((kol) => {
                const isExpanded = expandedKol === kol.handle
                return (
                  <article key={kol.handle} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{kol.name}</h3>
                          {kol.instagramUrl ? (
                            <a href={kol.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                              {kol.handle} <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <p className="mt-1 text-xs text-slate-500">{kol.handle}</p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{kol.region}</span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-slate-50 p-2">
                          <p className="text-sm font-bold text-[#002D74]">{kol.followers}</p>
                          <p className="text-[10px] text-slate-400">Followers</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2">
                          <p className="text-sm font-bold text-[#002D74]">{kol.engagement ?? '—'}</p>
                          <p className="text-[10px] text-slate-400">Engagement</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2">
                          <p className="text-sm font-bold text-[#002D74]">{kol.country}</p>
                          <p className="text-[10px] text-slate-400">Market</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{kol.specialty}</span>
                        <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{kol.platform}</span>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-slate-600">{kol.summary}</p>

                      {kol.youtubeVideoId && (
                        <button
                          onClick={() => setExpandedKol(isExpanded ? null : kol.handle)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
                        >
                          <Play className="h-3 w-3" />
                          {isExpanded ? '영상 접기' : 'YouTube 미리보기'}
                        </button>
                      )}
                    </div>

                    {isExpanded && kol.youtubeVideoId && (
                      <div className="border-t border-slate-100">
                        <div className="aspect-video bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${kol.youtubeVideoId}?rel=0`}
                            title={`${kol.name} YouTube`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                          />
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}

        {showCampaign ? (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Film className="h-5 w-5 text-[#002D74]" />
              <h2 className="text-base font-bold text-slate-950">Campaign benchmark ({CAMPAIGNS.length})</h2>
              <span className="text-xs text-slate-400">Thumbnail, detail link, and playable media preview are included.</span>
            </div>

            <div className="space-y-5">
              {CAMPAIGNS.map((campaign) => (
                <article key={`${campaign.brand}-${campaign.name}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{campaign.brand}</h3>
                          <span className="rounded-full bg-[#002D74] px-3 py-1 text-xs font-semibold text-white">{campaign.name}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {campaign.platforms.map((platform) => (
                            <MediaBadge key={platform} platform={platform} />
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{campaign.summary}</p>
                        <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">CLASSYS 인사이트</p>
                          <p className="mt-1 text-sm text-blue-950">{campaign.insight}</p>
                        </div>
                      </div>

                      <div className="grid shrink-0 grid-cols-3 gap-3 xl:min-w-[310px]">
                        <div className="rounded-2xl bg-slate-50 p-3 text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                            <Eye className="h-3 w-3" /> Impressions
                          </div>
                          <p className="text-sm font-bold text-[#002D74]">{campaign.kpi.impressions}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                            <Heart className="h-3 w-3" /> Engagement
                          </div>
                          <p className="text-sm font-bold text-[#002D74]">{campaign.kpi.engagement}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                            <MessageCircle className="h-3 w-3" /> Sentiment
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
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Source: {campaign.sourceLabel} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Media preview</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {campaign.media.map((media) => (
                        <div key={`${campaign.name}-${media.title}`} className="space-y-2">
                          <MediaThumbnail media={media} onOpen={setSelectedMedia} />
                          <div className="flex items-center justify-between gap-2 px-1">
                            <span className="text-xs text-slate-500">{media.metric}</span>
                            <a
                              href={media.detailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                              Detail <ExternalLink className="h-3 w-3" />
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
        ) : null}
      </div>

      {selectedMedia ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedMedia.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{selectedMedia.metric}</p>
              </div>
              <button onClick={() => setSelectedMedia(null)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Close preview">
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
                    <p className="mt-2 text-sm text-white/80">Open the detail link to view the original source asset.</p>
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
                  Open source detail <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={() => setSelectedMedia(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
