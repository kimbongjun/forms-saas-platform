'use client'

import { useState } from 'react'
import { RefreshCw, Clock, MapPin, ExternalLink, CalendarDays, CheckCircle, Star } from 'lucide-react'
import MarketNav from './MarketNav'

type RegionFilter = 'all' | 'asia' | 'europe' | 'americas'

interface MarketEvent {
  id: string
  name: string
  organizer: string
  location: string
  country: string
  region: 'asia' | 'europe' | 'americas'
  startDate: string
  endDate: string
  type: 'conference' | 'exhibition' | 'congress' | 'webinar'
  status: 'upcoming' | 'ongoing' | 'past'
  description: string
  website: string
  isAttending: boolean
  isKeyEvent: boolean
  notes?: string
}

const EVENTS: MarketEvent[] = [
  {
    id: '1',
    name: 'ESTRO Annual Meeting 2026',
    organizer: 'European Society for Radiotherapy & Oncology',
    location: 'Barcelona, Spain',
    country: '🇪🇸 Spain',
    region: 'europe',
    startDate: '2026-05-02',
    endDate: '2026-05-05',
    type: 'congress',
    status: 'ongoing',
    description: '방사선 치료 및 종양학 분야 유럽 최대 학회. 의료기기 기업 전시 부스 350+ 참가.',
    website: '#',
    isAttending: false,
    isKeyEvent: false,
  },
  {
    id: '2',
    name: 'MEDICA 2026',
    organizer: 'Messe Düsseldorf',
    location: 'Düsseldorf, Germany',
    country: '🇩🇪 Germany',
    region: 'europe',
    startDate: '2026-11-16',
    endDate: '2026-11-19',
    type: 'exhibition',
    status: 'upcoming',
    description: '세계 최대 의료기기 전시회. 의료미용기기 전문 Hall 별도 운영. 글로벌 바이어 6만명+ 참가.',
    website: '#',
    isAttending: true,
    isKeyEvent: true,
    notes: '부스 사전 계약 마감 6월 초. 조기 신청 시 Hall 6 프리미엄 위치 확보 가능.',
  },
  {
    id: '3',
    name: 'RSNA 2026',
    organizer: 'Radiological Society of North America',
    location: 'Chicago, USA',
    country: '🇺🇸 USA',
    region: 'americas',
    startDate: '2026-11-29',
    endDate: '2026-12-03',
    type: 'conference',
    status: 'upcoming',
    description: '방사선 의학 분야 세계 최대 학술대회. AI 기반 영상진단 섹션 급성장. 참가자 4만명+.',
    website: '#',
    isAttending: false,
    isKeyEvent: true,
  },
  {
    id: '4',
    name: 'ASLMS Annual Conference 2026',
    organizer: 'American Society for Laser Medicine & Surgery',
    location: 'Orlando, USA',
    country: '🇺🇸 USA',
    region: 'americas',
    startDate: '2026-04-23',
    endDate: '2026-04-26',
    type: 'conference',
    status: 'past',
    description: '레이저 의학·미용 분야 전문 학회. HIFU, 피코레이저, RF 최신 임상 연구 발표. 클래시스 VOLNEWMER 포스터 발표 완료.',
    website: '#',
    isAttending: true,
    isKeyEvent: true,
    notes: 'VOLNEWMER 포스터 발표 반응 우수. 미국 KOL 3명 후속 인터뷰 요청.',
  },
  {
    id: '5',
    name: 'AMWC Monaco 2026',
    organizer: 'Aesthetic & Anti-Aging Medicine World Congress',
    location: 'Monaco',
    country: '🇲🇨 Monaco',
    region: 'europe',
    startDate: '2026-04-03',
    endDate: '2026-04-05',
    type: 'congress',
    status: 'past',
    description: '의료미용 분야 글로벌 최고 권위 학회. 주요 KOL 강연 · 최신 기기 라이브 시연. 참가 전문의 4,000명+.',
    website: '#',
    isAttending: true,
    isKeyEvent: true,
  },
  {
    id: '6',
    name: 'KIMES 2026',
    organizer: 'Korea International Medical & Hospital Equipment Show',
    location: 'COEX, Seoul, Korea',
    country: '🇰🇷 Korea',
    region: 'asia',
    startDate: '2026-03-13',
    endDate: '2026-03-16',
    type: 'exhibition',
    status: 'past',
    description: '국내 최대 의료기기 전시회. 참가업체 1,200+, 관람객 7만명+. 클래시스 단독 부스 운영.',
    website: '#',
    isAttending: true,
    isKeyEvent: true,
  },
  {
    id: '7',
    name: 'IMCAS Asia 2026',
    organizer: 'International Master Course on Aging Science',
    location: 'Bangkok, Thailand',
    country: '🇹🇭 Thailand',
    region: 'asia',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    type: 'congress',
    status: 'upcoming',
    description: '아시아 최대 의료미용 학술대회. 동남아 KOL 네트워크 형성 최적 기회. 태국·베트남·인도네시아 유력 의료진 집결.',
    website: '#',
    isAttending: false,
    isKeyEvent: true,
    notes: '동남아 시장 확대 전략과 연계. 참가 여부 검토 필요.',
  },
  {
    id: '8',
    name: 'AAD Annual Meeting 2026',
    organizer: 'American Academy of Dermatology',
    location: 'San Diego, USA',
    country: '🇺🇸 USA',
    region: 'americas',
    startDate: '2026-03-07',
    endDate: '2026-03-11',
    type: 'conference',
    status: 'past',
    description: '미국 피부과학회 연례 학술대회. 피부미용기기 최신 임상 연구 집중 발표. 참가자 2만명+.',
    website: '#',
    isAttending: false,
    isKeyEvent: false,
  },
]

const TYPE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  conference: { label: '학술대회', bg: '#eff6ff', color: '#1d4ed8' },
  exhibition: { label: '전시회', bg: '#f0fdf4', color: '#15803d' },
  congress: { label: '학회', bg: '#fdf4ff', color: '#7e22ce' },
  webinar: { label: '웨비나', bg: '#fff7ed', color: '#c2410c' },
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  upcoming: { label: '예정', className: 'bg-blue-50 text-blue-700' },
  ongoing: { label: '진행중', className: 'bg-emerald-50 text-emerald-700' },
  past: { label: '종료', className: 'bg-gray-100 text-gray-500' },
}

const REGION_LABELS: Record<string, string> = { all: '전체', asia: 'Asia', europe: 'Europe', americas: 'Americas' }

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString('ko-KR', { year: 'numeric', ...opts })} — ${e.toLocaleDateString('ko-KR', { year: 'numeric', ...opts })}`
  }
  if (s.getMonth() !== e.getMonth()) {
    return `${s.toLocaleDateString('ko-KR', opts)} — ${e.toLocaleDateString('ko-KR', opts)}, ${s.getFullYear()}`
  }
  return `${s.getFullYear()}년 ${s.getMonth() + 1}월 ${s.getDate()}~${e.getDate()}일`
}

export default function EventsClient() {
  const [region, setRegion] = useState<RegionFilter>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-05-06 08:30')

  const filtered = region === 'all' ? EVENTS : EVENTS.filter((e) => e.region === region)
  const upcoming = filtered.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
  const past = filtered.filter((e) => e.status === 'past')

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const now = new Date()
    setLastUpdated(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    setRefreshing(false)
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <MarketNav />

      {/* 헤더 */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Event & Congress</h1>
            <p className="mt-0.5 text-sm text-gray-500">글로벌 전시 · 학회 일정 및 참가 현황</p>
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

      {/* 지역 필터 */}
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
        <div className="flex gap-2">
          {(['all', 'asia', 'europe', 'americas'] as RegionFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setRegion(key)}
              className={['rounded-xl px-4 py-2 text-sm font-medium transition-colors', region === key ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'].join(' ')}
              style={region === key ? { background: '#002D74' } : {}}
            >
              {REGION_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 max-w-5xl mx-auto w-full">
        {/* KPI 요약 */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: '전체 일정', value: filtered.length.toString() },
            { label: '예정/진행중', value: upcoming.length.toString() },
            { label: '클래시스 참가', value: filtered.filter((e) => e.isAttending).length.toString() },
            { label: 'Key Event', value: filtered.filter((e) => e.isKeyEvent).length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold" style={{ color: '#002D74' }}>{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* 예정 이벤트 */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: '#2C3E50' }}>
              <CalendarDays className="h-4 w-4 text-blue-500" />
              예정 / 진행중 ({upcoming.length})
            </h2>
            <div className="space-y-3">
              {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        )}

        {/* 종료 이벤트 */}
        {past.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              종료된 이벤트 ({past.length})
            </h2>
            <div className="space-y-3 opacity-75">
              {past.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: MarketEvent }) {
  const ts = TYPE_STYLE[event.type]
  const ss = STATUS_STYLE[event.status]

  return (
    <div className={['rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md', event.isKeyEvent ? 'border-blue-200' : 'border-gray-100'].join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${ss.className}`}>{ss.label}</span>
            <span className="rounded-lg px-2.5 py-0.5 text-xs font-medium" style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
            {event.isKeyEvent && (
              <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <Star className="h-3 w-3" />Key Event
              </span>
            )}
            {event.isAttending && (
              <span className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium" style={{ background: '#002D7410', color: '#002D74' }}>
                <CheckCircle className="h-3 w-3" />클래시스 참가
              </span>
            )}
          </div>

          <h3 className="mb-1 text-sm font-bold" style={{ color: '#2C3E50' }}>{event.name}</h3>
          <p className="mb-1 text-xs text-gray-500">{event.organizer}</p>

          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDateRange(event.startDate, event.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.country} {event.location}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>

          {event.notes && (
            <div className="mt-2 rounded-xl p-2.5" style={{ background: 'rgba(0,45,116,0.04)', borderLeft: '3px solid #0084C9' }}>
              <p className="text-xs leading-relaxed text-gray-700">{event.notes}</p>
            </div>
          )}
        </div>

        <a href={event.website} className="shrink-0 rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:text-gray-600">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
