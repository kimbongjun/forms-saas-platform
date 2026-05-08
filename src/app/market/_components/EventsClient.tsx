'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle, Building2, CalendarDays, CheckCircle2,
  ChevronLeft, ChevronRight, ExternalLink, List, MapPin,
  RefreshCw, ShieldCheck, Star, Users, X,
} from 'lucide-react'
import MarketNav from './MarketNav'

type RegionFilter = 'all' | 'asia' | 'europe' | 'americas'
type ViewMode = 'calendar' | 'list' | 'gantt'
type EventType = 'conference' | 'exhibition' | 'congress' | 'webinar'
type EventStatus = 'upcoming' | 'ongoing' | 'past'
type Confidence = 'verified' | 'estimated'

type MarketEvent = {
  id: string
  name: string
  organizer: string
  location: string
  country: string
  region: Exclude<RegionFilter, 'all'>
  startDate: string
  endDate: string
  type: EventType
  status: EventStatus
  description: string
  website: string
  isAttending: boolean
  isKeyEvent: boolean
  confidence: Confidence
  verifiedDate: string
  notes?: string
  competitorAttendees?: string[]
}

// 검증된 2025-2026 주요 에스테틱·의료 학회/전시 데이터
// confidence: 'verified' = 공식 사이트 확인 / 'estimated' = 일정 발표 전 추정
const EVENTS: MarketEvent[] = [
  {
    id: 'imcas-world-2026',
    name: 'IMCAS World Congress 2026',
    organizer: 'IMCAS (International Master Course on Aging Science)',
    location: 'Palais des Congrès, Paris, France',
    country: 'France',
    region: 'europe',
    startDate: '2026-01-29',
    endDate: '2026-02-01',
    type: 'congress',
    status: 'past',
    description: '전 세계 에스테틱·성형외과 전문의 15,000명 이상이 참여하는 세계 최대 규모의 에스테틱 의학 학술 대회. 신규 장비 론칭 및 임상 데이터 발표의 핵심 플랫폼.',
    website: 'https://www.imcas.com/en/congress/imcas-world-congress-2026',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'verified',
    verifiedDate: '2025-10-01',
    notes: '슈링크 유니버스 글로벌 임상 데이터 발표 및 경쟁사 신규 론칭 모니터링 핵심 이벤트.',
    competitorAttendees: ['Merz', 'Solta', 'InMode', 'Alma', 'Cynosure'],
  },
  {
    id: 'amwc-2026',
    name: 'AMWC 2026',
    organizer: 'Aesthetic & Anti-Aging Medicine World Congress (AMWC)',
    location: 'Grimaldi Forum, Monaco',
    country: 'Monaco',
    region: 'europe',
    startDate: '2026-03-26',
    endDate: '2026-03-28',
    type: 'congress',
    status: 'past',
    description: '모나코에서 개최되는 프리미엄 에스테틱 의학 세계 대회. 안티에이징·리프팅·보톡스·필러 분야의 최신 임상 트렌드와 글로벌 KOL 네트워킹의 장.',
    website: 'https://www.amwc.fr/',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'verified',
    verifiedDate: '2025-10-01',
    notes: '유럽 프리미엄 에스테틱 시장의 주요 KOL 및 경쟁사 마케팅 메시지 모니터링.',
    competitorAttendees: ['Merz', 'Solta', 'InMode', 'Alma'],
  },
  {
    id: 'aad-2026',
    name: 'AAD Annual Meeting 2026',
    organizer: 'American Academy of Dermatology (AAD)',
    location: 'San Diego Convention Center, California, USA',
    country: 'United States',
    region: 'americas',
    startDate: '2026-03-20',
    endDate: '2026-03-24',
    type: 'congress',
    status: 'past',
    description: '미국피부과학회 연간 학술대회. 북미 레이저·에너지 장비 트렌드와 임상 연구 발표의 중심 무대. 15,000명 이상의 피부과 전문의 참여.',
    website: 'https://www.aad.org/member/meetings-education/aad-meetings/annual-meeting',
    isAttending: false,
    isKeyEvent: true,
    confidence: 'verified',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Candela', 'Cynosure', 'InMode', 'Cutera'],
  },
  {
    id: 'aslms-2026',
    name: 'ASLMS Annual Conference 2026',
    organizer: 'American Society for Laser Medicine & Surgery (ASLMS)',
    location: 'Orlando, Florida, USA',
    country: 'United States',
    region: 'americas',
    startDate: '2026-04-15',
    endDate: '2026-04-18',
    type: 'conference',
    status: 'past',
    description: '레이저·RF·에너지 기반 의료기기 분야의 가장 중요한 임상 학술대회. 실제 적용 사례, 임상 데이터, 신기술 소개가 집중되는 행사.',
    website: 'https://www.aslms.org/meetings-events/annual-conference',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    notes: '리프팅 및 에너지 기반 장비 임상 세션 집중 모니터링. 경쟁사 발표 데이터 수집 필요.',
  },
  {
    id: 'ksds-spring-2026',
    name: 'KSDS Spring Meeting 2026',
    organizer: 'Korean Society for Dermatologic Surgery (KSDS, 대한피부외과학회)',
    location: 'Seoul, South Korea',
    country: 'South Korea',
    region: 'asia',
    startDate: '2026-05-08',
    endDate: '2026-05-09',
    type: 'congress',
    status: 'ongoing',
    description: '대한피부외과학회 춘계 학술대회. 국내 피부과 전문의 핵심 네트워킹 이벤트. 레이저·에너지 장비 임상 세션 다수 편성.',
    website: 'https://www.ksds.or.kr/',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    notes: '국내 클리닉 대상 슈링크 시리즈 임상 포스터 발표 및 경쟁사 동향 파악.',
  },
  {
    id: 'imcas-asia-2026',
    name: 'IMCAS Asia 2026',
    organizer: 'IMCAS',
    location: 'Bangkok, Thailand',
    country: 'Thailand',
    region: 'asia',
    startDate: '2026-06-11',
    endDate: '2026-06-13',
    type: 'congress',
    status: 'upcoming',
    description: '동남아·동아시아 에스테틱 의학 전문가 대상 IMCAS 아시아 지역 대회. 아시아 리프팅·스킨부스터·복합 시술 트렌드의 주요 관찰 포인트.',
    website: 'https://www.imcas.com/en/congress/imcas-asia',
    isAttending: false,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    notes: '동남아 유통 파트너 미팅 및 현지 KOL 네트워킹 기회.',
  },
  {
    id: 'asds-2026',
    name: 'ASDS Annual Meeting 2026',
    organizer: 'American Society for Dermatologic Surgery (ASDS)',
    location: 'Phoenix, Arizona, USA',
    country: 'United States',
    region: 'americas',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    type: 'congress',
    status: 'upcoming',
    description: '미국피부외과학회 연간 학술대회. 비수술적 시술, 에너지 장비, 보디 컨투어링 분야의 최신 임상 연구 및 테크놀로지 전시.',
    website: 'https://www.asds.net/medical-professionals/annual-meeting',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
  },
  {
    id: 'beautyworld-me-2026',
    name: 'Beautyworld Middle East 2026',
    organizer: 'Messe Frankfurt Middle East',
    location: 'Dubai World Trade Centre, Dubai, UAE',
    country: 'United Arab Emirates',
    region: 'asia',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    type: 'exhibition',
    status: 'upcoming',
    description: '중동 최대 규모 뷰티·메디컬 에스테틱 전시회. 중동·북아프리카 시장 유통 파트너십 발굴 및 지역 수요 파악에 적합.',
    website: 'https://beautyworld-middle-east.ae.messefrankfurt.com/',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'verified',
    verifiedDate: '2025-10-01',
    notes: '중동 채널 파트너십 확장 검토 시 우선 방문 고려.',
  },
  {
    id: 'medica-2026',
    name: 'MEDICA 2026',
    organizer: 'Messe Düsseldorf',
    location: 'Messe Düsseldorf, Germany',
    country: 'Germany',
    region: 'europe',
    startDate: '2026-11-16',
    endDate: '2026-11-19',
    type: 'exhibition',
    status: 'upcoming',
    description: '세계 최대 의료기기 전시회. 글로벌 경쟁사 전시 전략, 신제품 동향, 유통 파트너십 현황을 가장 넓게 파악할 수 있는 플랫폼.',
    website: 'https://www.medica-tradefair.com/',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'verified',
    verifiedDate: '2025-10-01',
    notes: '부스 계약 및 사전 미팅 슬롯 조기 확보 필요.',
  },
  {
    id: 'aesoph-2026',
    name: 'AESOPH Fall Meeting 2026',
    organizer: '대한미용성형외과학회 (AESOPH)',
    location: 'Seoul, South Korea',
    country: 'South Korea',
    region: 'asia',
    startDate: '2026-11-06',
    endDate: '2026-11-07',
    type: 'congress',
    status: 'upcoming',
    description: '국내 미용성형외과 분야 대표 학술대회. HIFU·RF·레이저 임상 세션 중심으로 국내 경쟁사 마케팅 현황 파악.',
    website: 'https://www.aesoph.org/',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
  },
  {
    id: 'prime-congress-2026',
    name: 'PRIME Congress 2026',
    organizer: 'PRIME Journal',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    region: 'europe',
    startDate: '2026-10-08',
    endDate: '2026-10-09',
    type: 'congress',
    status: 'upcoming',
    description: '유럽 프리미엄 에스테틱 의학 포럼. 영국·유럽 주요 KOL 발표 및 네트워킹 중심.',
    website: 'https://www.prime-journal.com/prime-congress/',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
  },
  {
    id: 'eadv-2026',
    name: 'EADV Congress 2026',
    organizer: 'European Academy of Dermatology and Venereology (EADV)',
    location: 'Amsterdam, Netherlands',
    country: 'Netherlands',
    region: 'europe',
    startDate: '2026-10-07',
    endDate: '2026-10-10',
    type: 'congress',
    status: 'upcoming',
    description: '유럽피부과학회 연간 학술대회. 유럽 레이저·에너지 장비 트렌드 및 규제 동향 파악의 핵심 이벤트.',
    website: 'https://www.eadv.org/congress/',
    isAttending: false,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Alma', 'Candela', 'Cynosure', 'Lumenis'],
  },
  {
    id: 'isaps-2026',
    name: 'ISAPS 2026',
    organizer: 'International Society of Aesthetic Plastic Surgery (ISAPS)',
    location: 'Phuket, Thailand',
    country: 'Thailand',
    region: 'asia',
    startDate: '2026-10-26',
    endDate: '2026-10-29',
    type: 'congress',
    status: 'upcoming',
    description: '세계 성형외과 학술대회. 비침습 시술 및 에너지 기반 장비 시술의 글로벌 트렌드 파악 가능.',
    website: 'https://www.isaps.org/',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Merz', 'Solta', 'InMode'],
  },
  {
    id: 'ksds-fall-2026',
    name: 'KSDS Fall Meeting 2026',
    organizer: 'Korean Society for Dermatologic Surgery (KSDS, 대한피부외과학회)',
    location: 'Seoul, South Korea',
    country: 'South Korea',
    region: 'asia',
    startDate: '2026-11-13',
    endDate: '2026-11-14',
    type: 'congress',
    status: 'upcoming',
    description: '대한피부외과학회 추계 학술대회. 국내 레이저·RF·HIFU 임상 세션 및 신기술 발표 집중.',
    website: 'https://www.ksds.or.kr/',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    notes: '추계 국내 학회 주요 발표 및 경쟁사 신제품 동향 파악.',
    competitorAttendees: ['Jeisys', 'Asterasys', 'Lutronic', 'Viol'],
  },
  {
    id: 'aad-summer-2026',
    name: 'AAD Summer Academy 2026',
    organizer: 'American Academy of Dermatology (AAD)',
    location: 'New York City, USA',
    country: 'United States',
    region: 'americas',
    startDate: '2026-07-25',
    endDate: '2026-07-27',
    type: 'conference',
    status: 'upcoming',
    description: 'AAD 서머 아카데미. 실용 임상 워크숍 및 에너지 기반 장비 최신 적용 기술 교육 집중.',
    website: 'https://www.aad.org/member/meetings-education/aad-meetings',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Candela', 'InMode', 'Cutera'],
  },
  {
    id: 'a3-paris-2026',
    name: 'Aesthetics & Anti-Aging (A3) 2026',
    organizer: 'A3 Congress',
    location: 'Paris, France',
    country: 'France',
    region: 'europe',
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    type: 'exhibition',
    status: 'upcoming',
    description: '파리 에스테틱·안티에이징 전시 및 학술대회. 유럽 에스테틱 장비 유통 파트너 네트워킹에 적합.',
    website: 'https://www.aestheticscongress.com/',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Merz', 'Alma'],
  },
  {
    id: 'imcas-china-2026',
    name: 'IMCAS China 2026',
    organizer: 'IMCAS',
    location: 'Shanghai, China',
    country: 'China',
    region: 'asia',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
    type: 'congress',
    status: 'upcoming',
    description: 'IMCAS 중국 지역 대회. 중국 에스테틱 시장 진출 및 NMPA 인증 현황 파악의 핵심 이벤트.',
    website: 'https://www.imcas.com/',
    isAttending: true,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    notes: '중국 유통 파트너 미팅 및 NMPA 규제 동향 파악 필요.',
    competitorAttendees: ['Merz', 'Solta', 'InMode', 'Cynosure'],
  },
  {
    id: 'amwc-asia-2026',
    name: 'AMWC Asia 2026',
    organizer: 'Aesthetic & Anti-Aging Medicine World Congress (AMWC)',
    location: 'Macau, China',
    country: 'Macau',
    region: 'asia',
    startDate: '2026-07-11',
    endDate: '2026-07-13',
    type: 'congress',
    status: 'upcoming',
    description: 'AMWC 아시아 대회. 아시아·태평양 에스테틱 의학 KOL 네트워킹 및 최신 리프팅 기술 트렌드 공유.',
    website: 'https://www.amwc.fr/',
    isAttending: false,
    isKeyEvent: true,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Merz', 'Solta', 'InMode', 'Alma'],
  },
  {
    id: 'face-conference-2026',
    name: 'FACE Conference 2026',
    organizer: 'FACE Conference',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    region: 'europe',
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    type: 'congress',
    status: 'upcoming',
    description: '영국 안면 미용시술 전문 학술대회. 필러·HIFU·RF 리프팅 임상 케이스 및 KOL 강연 중심.',
    website: 'https://www.faceconference.co.uk/',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'estimated',
    verifiedDate: '2025-10-01',
    competitorAttendees: ['Merz', 'Candela'],
  },
  {
    id: 'arab-health-2027',
    name: 'Arab Health 2027',
    organizer: 'Informa Markets',
    location: 'Dubai World Trade Centre, Dubai, UAE',
    country: 'United Arab Emirates',
    region: 'asia',
    startDate: '2027-01-26',
    endDate: '2027-01-29',
    type: 'exhibition',
    status: 'upcoming',
    description: '중동 최대 의료기기 전시회. 중동·북아프리카 시장 유통 파트너십 발굴 및 에스테틱 장비 수요 파악.',
    website: 'https://www.arabhealth.com/',
    isAttending: false,
    isKeyEvent: false,
    confidence: 'verified',
    verifiedDate: '2025-10-01',
    notes: '중동 채널 파트너 발굴 및 경쟁사 전시 전략 모니터링.',
    competitorAttendees: ['Alma', 'Wontech', 'Cynosure'],
  },
]

const TYPE_META: Record<EventType, { label: string; pill: string; dot: string; cell: string }> = {
  conference: { label: 'Conference', pill: 'bg-blue-50 text-blue-700', dot: '#2563eb', cell: '#dbeafe' },
  exhibition: { label: 'Exhibition', pill: 'bg-emerald-50 text-emerald-700', dot: '#059669', cell: '#d1fae5' },
  congress: { label: 'Congress', pill: 'bg-violet-50 text-violet-700', dot: '#7c3aed', cell: '#ede9fe' },
  webinar: { label: 'Webinar', pill: 'bg-amber-50 text-amber-700', dot: '#d97706', cell: '#fde68a' },
}

const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700' },
  ongoing: { label: 'Ongoing', className: 'bg-emerald-50 text-emerald-700' },
  past: { label: 'Past', className: 'bg-slate-100 text-slate-500' },
}

const REGION_LABELS: Record<RegionFilter, string> = {
  all: 'All',
  asia: 'Asia / Korea',
  europe: 'Europe',
  americas: 'Americas',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateRange(start: string, end: string) {
  const s = parseLocalDate(start)
  const e = parseLocalDate(end)
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  return `${fmt(s)} – ${fmt(e)}`
}

function isDateInEvent(date: Date, event: MarketEvent) {
  const s = parseLocalDate(event.startDate)
  const e = parseLocalDate(event.endDate)
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return t >= s && t <= e
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const offset = firstDay.getDay()
  const dates: Date[] = []
  for (let i = offset - 1; i >= 0; i--) dates.push(new Date(year, month, -i))
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= daysInMonth; day++) dates.push(new Date(year, month, day))
  let nextDay = 1
  while (dates.length < 42) { dates.push(new Date(year, month + 1, nextDay)); nextDay++ }
  return dates
}

export default function EventsClient() {
  const today = new Date()
  const [region, setRegion] = useState<RegionFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null)

  const filtered = useMemo(
    () => region === 'all' ? EVENTS : EVENTS.filter(e => e.region === region),
    [region]
  )
  const upcoming = filtered.filter(e => e.status === 'upcoming' || e.status === 'ongoing')
  const past = filtered.filter(e => e.status === 'past')
  const calendarDays = useMemo(() => buildCalendarDays(currentYear, currentMonth), [currentYear, currentMonth])
  const verifiedCount = filtered.filter(e => e.confidence === 'verified').length

  function getEventsForDay(date: Date) {
    return filtered.filter(e => isDateInEvent(date, e))
  }
  function isCurrentMonth(date: Date) {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }
  function isToday(date: Date) {
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
  }
  function goPrevMonth() {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11) }
    else setCurrentMonth(m => m - 1)
  }
  function goNextMonth() {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0) }
    else setCurrentMonth(m => m + 1)
  }

  return (
    <div className="min-h-full bg-[#f7f8fb]">
      <MarketNav />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Events</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Global Event Calendar</h1>
              <p className="mt-2 text-sm text-slate-500">
                에스테틱·의료기기 학회, 전시회, 지역 이벤트 일정을 정리했습니다.
              </p>
              {/* 데이터 검증 배너 */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {verifiedCount}개 이벤트 공식 사이트 검증 완료 · 나머지는 추정 일정 (실제 공고 후 업데이트 권장)
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'asia', 'europe', 'americas'] as RegionFilter[]).map(item => (
                <button
                  key={item}
                  onClick={() => setRegion(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    region === item ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {REGION_LABELS[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <StatCard label="전체 이벤트" value={String(filtered.length)} />
            <StatCard label="예정 / 진행 중" value={String(upcoming.length)} />
            <StatCard label="Key Watch 이벤트" value={String(filtered.filter(e => e.isKeyEvent).length)} />
            <StatCard label="참가 예정" value={String(filtered.filter(e => e.isAttending).length)} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">일정 보기</h2>
              <p className="mt-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> 검증</span>
                {' '}과{' '}
                <span className="inline-flex items-center gap-1 text-amber-600"><AlertCircle className="h-3.5 w-3.5" /> 추정</span>
                {' '}배지로 데이터 신뢰도를 표시합니다.
              </p>
            </div>
            <div className="flex overflow-hidden rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-[#002D74] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className="h-4 w-4" /> Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 border-l border-slate-200 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-[#002D74] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <List className="h-4 w-4" /> List
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`inline-flex items-center gap-2 border-l border-slate-200 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'gantt' ? 'bg-[#002D74] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="h-4 w-4" /> Gantt
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <button onClick={goPrevMonth} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-base font-bold text-slate-950">{currentYear} {MONTHS[currentMonth]}</h3>
                <button onClick={goNextMonth} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-3 flex flex-wrap gap-3">
                {Object.entries(TYPE_META).map(([type, meta]) => (
                  <div key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                  </div>
                ))}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Key event
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((date, idx) => {
                  const dayEvents = getEventsForDay(date)
                  const inMonth = isCurrentMonth(date)
                  const todayFlag = isToday(date)
                  return (
                    <div
                      key={`${date.toISOString()}-${idx}`}
                      className={`min-h-[100px] rounded-2xl border p-2 ${
                        inMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="mb-1.5 flex justify-end">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          todayFlag ? 'bg-[#002D74] text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="flex w-full items-center gap-1 rounded-lg px-1.5 py-1 text-left hover:opacity-80 transition-opacity"
                            style={{ background: TYPE_META[ev.type].cell }}
                          >
                            {ev.isKeyEvent
                              ? <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                              : <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_META[ev.type].dot }} />
                            }
                            <span className="truncate text-[10px] font-medium text-slate-800">{ev.name}</span>
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="px-1 text-[10px] text-slate-400">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="mt-6 grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="h-4 w-4 text-blue-700" />
                  <h3 className="text-sm font-semibold text-slate-900">예정 / 진행 중 ({upcoming.length})</h3>
                </div>
                <div className="space-y-3">
                  {upcoming.map(ev => <EventCard key={ev.id} event={ev} onOpen={setSelectedEvent} />)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900">완료된 행사 ({past.length})</h3>
                </div>
                <div className="space-y-3">
                  {past.map(ev => <EventCard key={ev.id} event={ev} onOpen={setSelectedEvent} />)}
                </div>
              </div>
            </div>
          ) : (
            <GanttView events={filtered} onOpen={setSelectedEvent} />
          )}
        </section>
      </div>

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return confidence === 'verified' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      <CheckCircle2 className="h-3 w-3" /> 검증
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      <AlertCircle className="h-3 w-3" /> 추정
    </span>
  )
}

function EventCard({ event, onOpen }: { event: MarketEvent; onOpen: (e: MarketEvent) => void }) {
  const status = STATUS_META[event.status]
  const type = TYPE_META[event.type]
  return (
    <button
      onClick={() => onOpen(event)}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${type.pill}`}>{type.label}</span>
        {event.isKeyEvent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Key
          </span>
        )}
        <ConfidenceBadge confidence={event.confidence} />
      </div>
      <h4 className="mt-2.5 text-sm font-bold text-slate-950">{event.name}</h4>
      <p className="mt-0.5 text-xs text-slate-500">{event.organizer}</p>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> {formatDateRange(event.startDate, event.endDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {event.country}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">{event.description}</p>
      {event.competitorAttendees && event.competitorAttendees.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {event.competitorAttendees.map(c => (
            <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{c}</span>
          ))}
        </div>
      )}
    </button>
  )
}

function GanttView({ events, onOpen }: { events: MarketEvent[]; onOpen: (e: MarketEvent) => void }) {
  const GANTT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const year = 2026
  const monthCount = 12
  const colW = 100

  const sortedEvents = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))

  function getBarStyle(startDate: string, endDate: string) {
    const s = parseLocalDate(startDate)
    const e = parseLocalDate(endDate)
    if (s.getFullYear() > year || e.getFullYear() < year) return null
    const startMonth = s.getFullYear() === year ? s.getMonth() : 0
    const startFrac = s.getFullYear() === year ? s.getDate() / 31 : 0
    const endMonth = e.getFullYear() === year ? e.getMonth() : 11
    const endFrac = e.getFullYear() === year ? e.getDate() / 31 : 1
    const left = (startMonth + startFrac) * colW
    const right = (endMonth + endFrac) * colW
    const width = Math.max(right - left, 8)
    return { left, width }
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <div style={{ minWidth: monthCount * colW + 240 }}>
        {/* Header */}
        <div className="flex" style={{ paddingLeft: 240 }}>
          {GANTT_MONTHS.map(m => (
            <div key={m} className="shrink-0 border-l border-slate-200 py-2 text-center text-[11px] font-semibold text-slate-400 uppercase" style={{ width: colW }}>
              {m}
            </div>
          ))}
        </div>
        {/* Rows */}
        <div className="space-y-1">
          {sortedEvents.map(ev => {
            const barStyle = getBarStyle(ev.startDate, ev.endDate)
            const typeColor = TYPE_META[ev.type].dot
            return (
              <div key={ev.id} className="flex items-center hover:bg-slate-50 rounded-lg">
                <div className="shrink-0 pr-3 py-2 flex items-center gap-2" style={{ width: 240 }}>
                  {ev.isKeyEvent && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                  <span className="text-xs font-medium text-slate-700 truncate">{ev.name}</span>
                </div>
                <div className="relative flex-1" style={{ height: 32 }}>
                  {/* Grid lines */}
                  {GANTT_MONTHS.map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 border-l border-slate-100" style={{ left: i * colW }} />
                  ))}
                  {barStyle && (
                    <button
                      onClick={() => onOpen(ev)}
                      className="absolute top-1/2 -translate-y-1/2 rounded-md text-[10px] font-semibold text-white px-1.5 flex items-center overflow-hidden hover:opacity-90 transition-opacity"
                      style={{
                        left: barStyle.left,
                        width: barStyle.width,
                        height: 20,
                        backgroundColor: typeColor,
                      }}
                      title={ev.name}
                    >
                      <span className="truncate">{barStyle.width > 30 ? ev.name : ''}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-slate-200" style={{ paddingLeft: 240 }}>
          {Object.entries(TYPE_META).map(([type, meta]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: meta.dot }} />
              {meta.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EventModal({ event, onClose }: { event: MarketEvent; onClose: () => void }) {
  const status = STATUS_META[event.status]
  const type = TYPE_META[event.type]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${type.pill}`}>{type.label}</span>
                {event.isKeyEvent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Key event
                  </span>
                )}
                {event.isAttending && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    <Building2 className="h-3 w-3" /> 참가 예정
                  </span>
                )}
                <ConfidenceBadge confidence={event.confidence} />
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-950">{event.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{event.organizer}</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" /> {formatDateRange(event.startDate, event.endDate)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" /> {event.location}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{event.description}</p>
          {event.notes && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Team note</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{event.notes}</p>
            </div>
          )}
          {event.competitorAttendees && event.competitorAttendees.length > 0 && (
            <div className="rounded-2xl bg-orange-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">경쟁사 참가 현황</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.competitorAttendees.map(c => (
                  <span key={c} className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">{c}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="h-3.5 w-3.5" />
            데이터 검증일: {event.verifiedDate} · 신뢰도: {event.confidence === 'verified' ? '공식 사이트 확인' : '추정 (공고 전)'}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Close
          </button>
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#002D74] px-4 py-2 text-sm font-medium text-white hover:bg-[#001f4f]"
          >
            공식 사이트 <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
