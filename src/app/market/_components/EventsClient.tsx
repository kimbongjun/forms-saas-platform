'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, List, MapPin, ExternalLink, Star, CheckCircle, Building2, X } from 'lucide-react'
import MarketNav from './MarketNav'

type RegionFilter = 'all' | 'asia' | 'europe' | 'americas'
type ViewMode = 'calendar' | 'list'

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
  // 추가 이벤트 4개
  {
    id: '9',
    name: 'IMCAS World Congress 2026',
    organizer: 'International Master Course on Aging Science',
    location: 'Paris, France',
    country: '🇫🇷 France',
    region: 'europe',
    startDate: '2026-01-30',
    endDate: '2026-02-01',
    type: 'congress',
    status: 'past',
    description: '세계 최대 의료미용 학술 행사. 글로벌 KOL 200명+ 강연. 피부과·성형외과 전문의 1만명+ 참가.',
    website: '#',
    isAttending: false,
    isKeyEvent: true,
  },
  {
    id: '10',
    name: 'IAOMD 2026',
    organizer: 'International Academy of Oral Medicine and Dentistry',
    location: 'Singapore',
    country: '🇸🇬 Singapore',
    region: 'asia',
    startDate: '2026-07-18',
    endDate: '2026-07-20',
    type: 'congress',
    status: 'upcoming',
    description: '구강의학 및 치과 분야 국제 학술대회. 아시아·태평양 지역 치의학계 주요 행사. 싱가포르 컨벤션센터 개최.',
    website: '#',
    isAttending: false,
    isKeyEvent: false,
  },
  {
    id: '11',
    name: 'Beautyworld Middle East 2026',
    organizer: 'Messe Frankfurt Middle East',
    location: 'Dubai World Trade Centre, Dubai',
    country: '🇦🇪 UAE',
    region: 'americas',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    type: 'exhibition',
    status: 'upcoming',
    description: '중동 최대 뷰티·미용기기 전시회. 의료미용기기 전문 섹션 확대. GCC 지역 바이어 2만명+ 참가.',
    website: '#',
    isAttending: false,
    isKeyEvent: false,
    notes: '중동 시장 진출 검토 대상 행사.',
  },
  {
    id: '12',
    name: 'PRIME Congress 2026',
    organizer: 'PRIME Journal',
    location: 'London, UK',
    country: '🇬🇧 UK',
    region: 'europe',
    startDate: '2026-10-08',
    endDate: '2026-10-09',
    type: 'congress',
    status: 'upcoming',
    description: '의료미용 분야 유럽 프리미엄 학술 심포지엄. 필러·보톡스·에너지 기반 기기 최신 임상 발표. 유럽 KOL 네트워크 구축.',
    website: '#',
    isAttending: false,
    isKeyEvent: false,
  },
]

// 이벤트 타입별 색상
const TYPE_COLOR: Record<string, { bg: string; text: string; dot: string; cellBg: string }> = {
  conference: { bg: '#eff6ff', text: '#1d4ed8', dot: '#1d4ed8', cellBg: '#dbeafe' },
  exhibition:  { bg: '#f0fdf4', text: '#15803d', dot: '#15803d', cellBg: '#bbf7d0' },
  congress:    { bg: '#fdf4ff', text: '#7e22ce', dot: '#7e22ce', cellBg: '#e9d5ff' },
  webinar:     { bg: '#fff7ed', text: '#c2410c', dot: '#c2410c', cellBg: '#fed7aa' },
}

const TYPE_LABEL: Record<string, string> = {
  conference: '학술대회',
  exhibition: '전시회',
  congress: '학회',
  webinar: '웨비나',
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  upcoming: { label: '예정', className: 'bg-blue-50 text-blue-700' },
  ongoing:  { label: '진행중', className: 'bg-emerald-50 text-emerald-700' },
  past:     { label: '종료', className: 'bg-gray-100 text-gray-500' },
}

const REGION_LABELS: Record<string, string> = { all: '전체', asia: 'Asia', europe: 'Europe', americas: 'Americas' }
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

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

/** YYYY-MM-DD 문자열을 로컬 날짜 객체로 변환 (UTC 오프셋 방지) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 날짜가 이벤트 기간에 포함되는지 확인 */
function isDateInEvent(date: Date, event: MarketEvent): boolean {
  const start = parseLocalDate(event.startDate)
  const end = parseLocalDate(event.endDate)
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return d >= start && d <= end
}

/** 6주×7일 캘린더 셀 배열 생성 */
function buildCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 0=일요일
  const days: Date[] = []
  // 이전 달 날짜
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }
  // 현재 달 날짜
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d))
  }
  // 다음 달 날짜 (42개 채우기)
  let next = 1
  while (days.length < 42) {
    days.push(new Date(year, month + 1, next++))
  }
  return days
}

export default function EventsClient() {
  const today = new Date()
  const [region, setRegion] = useState<RegionFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null)

  const filtered = region === 'all' ? EVENTS : EVENTS.filter((e) => e.region === region)
  const upcoming = filtered.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
  const past = filtered.filter((e) => e.status === 'past')

  const calendarDays = useMemo(() => buildCalendarDays(currentYear, currentMonth), [currentYear, currentMonth])

  function prevMonth() {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11) }
    else setCurrentMonth(m => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0) }
    else setCurrentMonth(m => m + 1)
  }

  /** 해당 날짜에 표시할 이벤트 목록 (필터 적용) */
  function getEventsForDay(date: Date): MarketEvent[] {
    return filtered.filter((e) => isDateInEvent(date, e))
  }

  function isToday(date: Date): boolean {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  function isCurrentMonth(date: Date): boolean {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <MarketNav />

      {/* 헤더 */}
      <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Event Calendar</h1>
            <p className="mt-0.5 text-sm text-gray-500">글로벌 전시 · 학회 일정 및 참가 현황</p>
          </div>

          <div className="flex items-center gap-2">
            {/* 지역 필터 */}
            <div className="flex gap-1">
              {(['all', 'asia', 'europe', 'americas'] as RegionFilter[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setRegion(key)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    region === key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                  style={region === key ? { background: '#002D74' } : {}}
                >
                  {REGION_LABELS[key]}
                </button>
              ))}
            </div>

            {/* 뷰 전환 */}
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('calendar')}
                className={['flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors', viewMode === 'calendar' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'].join(' ')}
                style={viewMode === 'calendar' ? { background: '#002D74' } : {}}
                title="캘린더 뷰"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">캘린더</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={['flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200', viewMode === 'list' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'].join(' ')}
                style={viewMode === 'list' ? { background: '#002D74' } : {}}
                title="리스트 뷰"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">리스트</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 sm:px-6 max-w-6xl mx-auto w-full">

        {/* ─── 캘린더 뷰 ─── */}
        {viewMode === 'calendar' && (
          <div>
            {/* 월 네비게이션 */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-base font-bold" style={{ color: '#2C3E50' }}>
                {currentYear}년 {MONTH_NAMES[currentMonth]}
              </h2>
              <button
                onClick={nextMonth}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 범례 */}
            <div className="mb-3 flex flex-wrap gap-3">
              {Object.entries(TYPE_COLOR).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color.dot }} />
                  <span className="text-xs text-gray-500">{TYPE_LABEL[type]}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                <span className="text-xs text-gray-500">Key Event</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-2.5 w-2.5 text-blue-700" />
                <span className="text-xs text-gray-500">클래시스 참가</span>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={[
                    'py-2 text-center text-xs font-semibold',
                    i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500',
                  ].join(' ')}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 border-l border-t border-gray-100">
              {calendarDays.map((date, idx) => {
                const dayEvents = getEventsForDay(date)
                const inMonth = isCurrentMonth(date)
                const todayFlag = isToday(date)
                const isSun = idx % 7 === 0
                const isSat = idx % 7 === 6

                return (
                  <div
                    key={idx}
                    className={[
                      'border-b border-r border-gray-100 min-h-[80px] sm:min-h-[100px] p-1 sm:p-1.5',
                      inMonth ? 'bg-white' : 'bg-gray-50/60',
                    ].join(' ')}
                  >
                    {/* 날짜 숫자 */}
                    <div className="mb-1 flex justify-end">
                      <span
                        className={[
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          todayFlag ? 'text-white font-bold' : '',
                          !todayFlag && !inMonth ? 'text-gray-300' : '',
                          !todayFlag && inMonth && isSun ? 'text-red-400' : '',
                          !todayFlag && inMonth && isSat ? 'text-blue-400' : '',
                          !todayFlag && inMonth && !isSun && !isSat ? 'text-gray-700' : '',
                        ].join(' ')}
                        style={todayFlag ? { background: '#002D74' } : {}}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* 이벤트 목록 */}
                    <div className="space-y-0.5">
                      {dayEvents.map((event) => {
                        const tc = TYPE_COLOR[event.type]
                        // 이벤트 시작일인지 확인 (시작일에만 이름 표시)
                        const eventStart = parseLocalDate(event.startDate)
                        const isStart =
                          date.getFullYear() === eventStart.getFullYear() &&
                          date.getMonth() === eventStart.getMonth() &&
                          date.getDate() === eventStart.getDate()
                        // 해당 주의 첫날(일요일)인지 확인
                        const isWeekStart = idx % 7 === 0

                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left group"
                          >
                            {/* 도트 (모바일) + 이벤트 바 (데스크톱) */}
                            <div
                              className="flex items-center gap-0.5 rounded px-0.5 py-0.5 sm:px-1 transition-opacity hover:opacity-80"
                              style={{ background: tc.cellBg }}
                            >
                              {/* 모바일: 도트만 */}
                              <span
                                className="block h-1.5 w-1.5 shrink-0 rounded-full sm:hidden"
                                style={{ background: tc.dot }}
                              />

                              {/* 데스크톱: 아이콘 + 이름 */}
                              <span className="hidden sm:flex items-center gap-0.5 min-w-0 w-full">
                                {event.isKeyEvent && (
                                  <Star className="h-2.5 w-2.5 shrink-0 fill-amber-500 text-amber-500" />
                                )}
                                {event.isAttending && (
                                  <Building2 className="h-2.5 w-2.5 shrink-0" style={{ color: tc.text }} />
                                )}
                                {(isStart || isWeekStart) && (
                                  <span
                                    className="truncate text-[10px] font-medium leading-tight"
                                    style={{ color: tc.text }}
                                  >
                                    {event.name}
                                  </span>
                                )}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 모달 */}
            {selectedEvent && (
              <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
          </div>
        )}

        {/* ─── 리스트 뷰 ─── */}
        {viewMode === 'list' && (
          <div>
            {/* KPI 요약 */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
        )}
      </div>
    </div>
  )
}

/* ── 이벤트 상세 모달 ── */
function EventModal({ event, onClose }: { event: MarketEvent; onClose: () => void }) {
  const tc = TYPE_COLOR[event.type]
  const ss = STATUS_STYLE[event.status]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* 모달 헤더 */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-lg px-2.5 py-0.5 text-xs font-medium"
                style={{ background: tc.bg, color: tc.text }}
              >
                {TYPE_LABEL[event.type]}
              </span>
              <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${ss.className}`}>
                {ss.label}
              </span>
              {event.isKeyEvent && (
                <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />Key Event
                </span>
              )}
              {event.isAttending && (
                <span className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium" style={{ background: '#002D7410', color: '#002D74' }}>
                  <Building2 className="h-3 w-3" />클래시스 참가
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-3 text-base font-bold" style={{ color: '#2C3E50' }}>{event.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{event.organizer}</p>
        </div>

        {/* 모달 바디 */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{event.country} · {event.location}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
          {event.notes && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(0,45,116,0.04)', borderLeft: '3px solid #0084C9' }}>
              <p className="text-xs leading-relaxed text-gray-700">{event.notes}</p>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="border-t border-gray-100 px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <a
            href={event.website}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white transition-colors hover:opacity-90"
            style={{ background: '#002D74' }}
          >
            <ExternalLink className="h-4 w-4" />
            홈페이지
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── 리스트 뷰 카드 ── */
function EventCard({ event }: { event: MarketEvent }) {
  const tc = TYPE_COLOR[event.type]
  const ss = STATUS_STYLE[event.status]

  return (
    <div className={['rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md', event.isKeyEvent ? 'border-blue-200' : 'border-gray-100'].join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${ss.className}`}>{ss.label}</span>
            <span className="rounded-lg px-2.5 py-0.5 text-xs font-medium" style={{ background: tc.bg, color: tc.text }}>{TYPE_LABEL[event.type]}</span>
            {event.isKeyEvent && (
              <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />Key Event
              </span>
            )}
            {event.isAttending && (
              <span className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium" style={{ background: '#002D7410', color: '#002D74' }}>
                <Building2 className="h-3 w-3" />클래시스 참가
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
