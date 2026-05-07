'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  List,
  MapPin,
  Star,
  X,
} from 'lucide-react'
import MarketNav from './MarketNav'

type RegionFilter = 'all' | 'asia' | 'europe' | 'americas'
type ViewMode = 'calendar' | 'list'
type EventType = 'conference' | 'exhibition' | 'congress' | 'webinar'
type EventStatus = 'upcoming' | 'ongoing' | 'past'

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
  notes?: string
}

const EVENTS: MarketEvent[] = [
  {
    id: 'amwc-2026',
    name: 'AMWC Monaco 2026',
    organizer: 'Aesthetic & Anti-Aging Medicine World Congress',
    location: 'Grimaldi Forum, Monaco',
    country: 'Monaco',
    region: 'europe',
    startDate: '2026-03-26',
    endDate: '2026-03-28',
    type: 'congress',
    status: 'past',
    description: '글로벌 에스테틱 의사와 디바이스 기업이 밀집하는 대표 학회입니다. 리프팅, 주사, 콤비네이션 시술 트렌드 파악에 적합합니다.',
    website: 'https://www.amwc-conference.com/',
    isAttending: true,
    isKeyEvent: true,
    notes: '프리미엄 리프팅 카테고리 경쟁 메시지와 KOL 세션 구성을 함께 확인한 이벤트로 분류합니다.',
  },
  {
    id: 'aslms-2026',
    name: 'ASLMS Annual Conference 2026',
    organizer: 'American Society for Laser Medicine & Surgery',
    location: 'Orlando, Florida, USA',
    country: 'United States',
    region: 'americas',
    startDate: '2026-04-23',
    endDate: '2026-04-26',
    type: 'conference',
    status: 'past',
    description: '레이저, RF, 에너지 기반 장비의 임상 데이터와 실제 적용 사례가 집중되는 행사입니다.',
    website: 'https://www.aslms.org/annualconference',
    isAttending: true,
    isKeyEvent: true,
    notes: '리프팅과 재생 카테고리의 임상 스토리텔링 포맷을 벤치마킹하기 좋은 이벤트입니다.',
  },
  {
    id: 'estro-2026',
    name: 'ESTRO Annual Meeting 2026',
    organizer: 'European Society for Radiotherapy & Oncology',
    location: 'Barcelona, Spain',
    country: 'Spain',
    region: 'europe',
    startDate: '2026-05-02',
    endDate: '2026-05-05',
    type: 'congress',
    status: 'ongoing',
    description: '방사선 치료 중심 행사이지만 에너지 기반 장비와 이미지 가이던스 흐름을 읽기 위한 참고 이벤트로 포함했습니다.',
    website: 'https://www.estro.org/Congresses/ESTRO-2026',
    isAttending: false,
    isKeyEvent: false,
  },
  {
    id: 'imcas-asia-2026',
    name: 'IMCAS Asia 2026',
    organizer: 'IMCAS',
    location: 'Bangkok, Thailand',
    country: 'Thailand',
    region: 'asia',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    type: 'congress',
    status: 'upcoming',
    description: '아시아 리프팅, 스킨 부스터, 복합 시술 KOL 네트워크를 보기 좋은 행사입니다.',
    website: 'https://www.imcas.com/en/attend/imcas-asia',
    isAttending: false,
    isKeyEvent: true,
    notes: '동남아 유통 파트너 발굴과 학술 메시지 현지화를 동시에 점검하기 좋은 일정입니다.',
  },
  {
    id: 'iaomd-2026',
    name: 'IAOMD 2026',
    organizer: 'International Academy of Oral Medicine and Dentistry',
    location: 'Singapore',
    country: 'Singapore',
    region: 'asia',
    startDate: '2026-07-18',
    endDate: '2026-07-20',
    type: 'conference',
    status: 'upcoming',
    description: '구강 및 안면 관련 학술 교류 행사로, 페이셜 에너지 디바이스 응용 맥락을 살피기 위한 보조 비교군입니다.',
    website: 'https://www.iaomd.org/',
    isAttending: false,
    isKeyEvent: false,
  },
  {
    id: 'prime-2026',
    name: 'PRIME Congress 2026',
    organizer: 'PRIME Journal',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    region: 'europe',
    startDate: '2026-10-08',
    endDate: '2026-10-09',
    type: 'congress',
    status: 'upcoming',
    description: '유럽 프리미엄 에스테틱 시장에서 브랜드와 학술 메시지를 동시에 확인하기 좋은 포럼입니다.',
    website: 'https://www.prime-journal.com/congress/',
    isAttending: false,
    isKeyEvent: false,
  },
  {
    id: 'beautyworld-me-2026',
    name: 'Beautyworld Middle East 2026',
    organizer: 'Messe Frankfurt Middle East',
    location: 'Dubai World Trade Centre, UAE',
    country: 'United Arab Emirates',
    region: 'asia',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    type: 'exhibition',
    status: 'upcoming',
    description: '중동 미용 및 메디컬 에스테틱 유통 파트너십과 지역 수요를 점검하기 위한 전시회입니다.',
    website: 'https://beautyworld-middle-east.ae.messefrankfurt.com/dubai/en.html',
    isAttending: false,
    isKeyEvent: false,
    notes: '중동 채널 확장 검토 시 우선순위를 높일 수 있는 지역 이벤트입니다.',
  },
  {
    id: 'medica-2026',
    name: 'MEDICA 2026',
    organizer: 'Messe Dusseldorf',
    location: 'Dusseldorf, Germany',
    country: 'Germany',
    region: 'europe',
    startDate: '2026-11-16',
    endDate: '2026-11-19',
    type: 'exhibition',
    status: 'upcoming',
    description: '대형 글로벌 의료기기 전시회로 유통, 파트너십, 경쟁사 부스 전략을 가장 넓게 볼 수 있습니다.',
    website: 'https://www.medica-tradefair.com/',
    isAttending: true,
    isKeyEvent: true,
    notes: '부스 계약과 미팅 슬롯이 빠르게 마감되므로 사전 영업 준비가 중요합니다.',
  },
  {
    id: 'rsna-2026',
    name: 'RSNA 2026',
    organizer: 'Radiological Society of North America',
    location: 'Chicago, Illinois, USA',
    country: 'United States',
    region: 'americas',
    startDate: '2026-11-29',
    endDate: '2026-12-03',
    type: 'conference',
    status: 'upcoming',
    description: '영상, AI, 이미지 워크플로우 관점에서 참고 가치가 있는 북미 대형 행사입니다.',
    website: 'https://www.rsna.org/annual-meeting',
    isAttending: false,
    isKeyEvent: false,
  },
]

const TYPE_META: Record<EventType, { label: string; pill: string; dot: string; cell: string }> = {
  conference: { label: 'Conference', pill: 'bg-blue-50 text-blue-700', dot: '#2563eb', cell: '#dbeafe' },
  exhibition: { label: 'Exhibition', pill: 'bg-emerald-50 text-emerald-700', dot: '#059669', cell: '#d1fae5' },
  congress: { label: 'Congress', pill: 'bg-violet-50 text-violet-700', dot: '#7c3aed', cell: '#e9d5ff' },
  webinar: { label: 'Webinar', pill: 'bg-amber-50 text-amber-700', dot: '#d97706', cell: '#fde68a' },
}

const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700' },
  ongoing: { label: 'Ongoing', className: 'bg-emerald-50 text-emerald-700' },
  past: { label: 'Past', className: 'bg-slate-100 text-slate-500' },
}

const REGION_LABELS: Record<RegionFilter, string> = {
  all: 'All',
  asia: 'Asia',
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
  const startDate = parseLocalDate(start)
  const endDate = parseLocalDate(end)
  const format = (date: Date) =>
    `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  return `${format(startDate)} - ${format(endDate)}`
}

function isDateInEvent(date: Date, event: MarketEvent) {
  const start = parseLocalDate(event.startDate)
  const end = parseLocalDate(event.endDate)
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return target >= start && target <= end
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const offset = firstDay.getDay()
  const dates: Date[] = []

  for (let i = offset - 1; i >= 0; i -= 1) {
    dates.push(new Date(year, month, -i))
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(new Date(year, month, day))
  }

  let nextDay = 1
  while (dates.length < 42) {
    dates.push(new Date(year, month + 1, nextDay))
    nextDay += 1
  }

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
    () => (region === 'all' ? EVENTS : EVENTS.filter((event) => event.region === region)),
    [region]
  )
  const upcoming = filtered.filter((event) => event.status === 'upcoming' || event.status === 'ongoing')
  const past = filtered.filter((event) => event.status === 'past')
  const calendarDays = useMemo(() => buildCalendarDays(currentYear, currentMonth), [currentYear, currentMonth])

  function getEventsForDay(date: Date) {
    return filtered.filter((event) => isDateInEvent(date, event))
  }

  function isCurrentMonth(date: Date) {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }

  function isToday(date: Date) {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  function goPrevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((value) => value - 1)
      setCurrentMonth(11)
      return
    }
    setCurrentMonth((value) => value - 1)
  }

  function goNextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((value) => value + 1)
      setCurrentMonth(0)
      return
    }
    setCurrentMonth((value) => value + 1)
  }

  return (
    <div className="min-h-full bg-[#f7f8fb]">
      <MarketNav />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Market / Events</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Global Event Calendar</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                학회, 전시회, 지역 파트너 이벤트를 한 화면에서 정리했습니다. 시장조사팀이 우선 확인할 일정과 공식 링크를 함께 제공합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'asia', 'europe', 'americas'] as RegionFilter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setRegion(item)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    region === item ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {REGION_LABELS[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Visible events" value={String(filtered.length)} />
            <StatCard label="Upcoming / ongoing" value={String(upcoming.length)} />
            <StatCard label="CLASSYS watch list" value={String(filtered.filter((event) => event.isKeyEvent).length)} />
            <StatCard label="Attending / priority" value={String(filtered.filter((event) => event.isAttending).length)} />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Schedule view</h2>
              <p className="mt-1 text-sm text-slate-500">캘린더와 리스트 보기 모두 같은 데이터셋을 사용합니다.</p>
            </div>

            <div className="flex overflow-hidden rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('calendar')}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                  viewMode === 'calendar' ? 'bg-[#002D74] text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={[
                  'inline-flex items-center gap-2 border-l border-slate-200 px-4 py-2 text-sm font-medium transition-colors',
                  viewMode === 'list' ? 'bg-[#002D74] text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <button onClick={goPrevMonth} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-base font-bold text-slate-950">
                  {currentYear} {MONTHS[currentMonth]}
                </h3>
                <button onClick={goNextMonth} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex flex-wrap gap-3">
                {Object.entries(TYPE_META).map(([type, meta]) => (
                  <div key={type} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Key event
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Building2 className="h-3 w-3 text-[#002D74]" />
                  Priority / attending
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  const events = getEventsForDay(date)
                  const inCurrentMonth = isCurrentMonth(date)
                  const todayFlag = isToday(date)

                  return (
                    <div
                      key={`${date.toISOString()}-${index}`}
                      className={[
                        'min-h-[110px] rounded-2xl border p-2',
                        inCurrentMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50',
                      ].join(' ')}
                    >
                      <div className="mb-2 flex justify-end">
                        <span
                          className={[
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                            todayFlag
                              ? 'bg-[#002D74] text-white'
                              : inCurrentMonth
                                ? 'text-slate-700'
                                : 'text-slate-300',
                          ].join(' ')}
                        >
                          {date.getDate()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {events.slice(0, 3).map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="flex w-full items-center gap-1 rounded-lg px-1.5 py-1 text-left transition-opacity hover:opacity-80"
                            style={{ background: TYPE_META[event.type].cell }}
                          >
                            {event.isKeyEvent ? (
                              <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                            ) : event.isAttending ? (
                              <Building2 className="h-3 w-3 shrink-0 text-[#002D74]" />
                            ) : (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: TYPE_META[event.type].dot }}
                              />
                            )}
                            <span className="truncate text-[11px] font-medium text-slate-800">{event.name}</span>
                          </button>
                        ))}
                        {events.length > 3 ? <p className="px-1.5 text-[11px] text-slate-400">+{events.length - 3} more</p> : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-700" />
                    <h3 className="text-sm font-semibold text-slate-900">Upcoming and ongoing</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {upcoming.map((event) => (
                      <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Completed reference events</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {past.map((event) => (
                      <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedEvent ? <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} /> : null}
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

function EventCard({ event, onOpen }: { event: MarketEvent; onOpen: (event: MarketEvent) => void }) {
  const status = STATUS_META[event.status]
  const type = TYPE_META[event.type]

  return (
    <button
      onClick={() => onOpen(event)}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', status.className].join(' ')}>{status.label}</span>
        <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', type.pill].join(' ')}>{type.label}</span>
        {event.isKeyEvent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            Key
          </span>
        ) : null}
      </div>

      <h4 className="mt-3 text-sm font-bold text-slate-950">{event.name}</h4>
      <p className="mt-1 text-xs text-slate-500">{event.organizer}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDateRange(event.startDate, event.endDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {event.country}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.description}</p>
    </button>
  )
}

function EventModal({ event, onClose }: { event: MarketEvent; onClose: () => void }) {
  const status = STATUS_META[event.status]
  const type = TYPE_META[event.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', status.className].join(' ')}>{status.label}</span>
                <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', type.pill].join(' ')}>{type.label}</span>
                {event.isKeyEvent ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Key event
                  </span>
                ) : null}
                {event.isAttending ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    <Building2 className="h-3 w-3" />
                    Priority / attending
                  </span>
                ) : null}
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
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatDateRange(event.startDate, event.endDate)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              {event.location}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">{event.description}</p>

          {event.notes ? (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Team note</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{event.notes}</p>
            </div>
          ) : null}
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
            Official site
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
