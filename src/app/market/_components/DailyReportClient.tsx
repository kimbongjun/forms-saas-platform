'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  BarChart2,
  CalendarDays,
  Clock,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Map,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import MarketNav from './MarketNav'

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[480px] items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-xs text-blue-600">Loading market map...</p>
      </div>
    </div>
  ),
})

const MarketCharts = dynamic(() => import('./MarketCharts'), { ssr: false })

const REPORT_DATE = '2026.05.07'
const LAST_UPDATED = '2026-05-07 09:10'

type TabKey = 'report' | 'globe' | 'charts'

type DomainCard = {
  key: string
  icon: React.ReactNode
  label: string
  color: string
  bg: string
  count: number
  highlights: string[]
  insight: string
  sourceLinks: Array<{ title: string; url: string; source: string }>
}

const DOMAIN_CARDS: DomainCard[] = [
  {
    key: 'tech',
    icon: <Cpu className="h-5 w-5" />,
    label: 'Technology Trends',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    count: 8,
    highlights: [
      '복합 에너지 장비는 리프팅 단품보다 프로토콜 세트로 포지셔닝되는 흐름이 강합니다.',
      '실시간 이미징, 쿨링, 소비자 친화형 UX가 프리미엄 세일즈 포인트로 묶이고 있습니다.',
      'RF와 HIFU를 분리 판매하기보다 업셀링 가능한 조합으로 묶는 메시지가 늘고 있습니다.',
    ],
    insight: 'CLASSYS는 리프팅 성능만이 아니라 시술 경험, 교육, 복합 시술 제안을 함께 보여줘야 프리미엄 포지셔닝이 강해집니다.',
    sourceLinks: [
      { title: 'CLASSYS Corporate Overview', url: 'https://classys.com/company/classys/', source: 'CLASSYS' },
      { title: 'Lutronic About Us', url: 'https://www.lutronic.com/us/about-us/', source: 'Lutronic' },
      { title: 'Jeisys Product Overview', url: 'https://www.jeisys.com/eng/', source: 'Jeisys' },
    ],
  },
  {
    key: 'ai',
    icon: <Zap className="h-5 w-5" />,
    label: 'AI / SaMD',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    count: 5,
    highlights: [
      '시술 결과 분석과 환자 상담 보조 기능이 AI 모듈로 묶여 들어가는 사례가 많아지고 있습니다.',
      'SaMD는 단독 제품보다 하드웨어 판매를 보조하는 구독형 서비스로 설계되는 경향이 강합니다.',
      '임상 데이터 정리와 before/after 리포팅 자동화가 현장 수요를 만들고 있습니다.',
    ],
    insight: '시장 조사 관점에서는 장비 자체보다 상담 보조, 추적 관찰, 임상 리포트 생성까지 포함한 소프트웨어 묶음이 실제 경쟁력입니다.',
    sourceLinks: [
      { title: 'FDA Digital Health', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence', source: 'FDA' },
      { title: 'Canfield Scientific News', url: 'https://www.canfieldsci.com/news', source: 'Canfield' },
      { title: 'Revian Company', url: 'https://revian.com', source: 'Revian' },
    ],
  },
  {
    key: 'marketing',
    icon: <TrendingUp className="h-5 w-5" />,
    label: 'Marketing & Campaigns',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    count: 6,
    highlights: [
      '글로벌 브랜드는 실제 환자 결과와 의사 코멘트를 한 콘텐츠 안에서 같이 보여주는 포맷을 반복합니다.',
      '라이브 Q&A, 숏폼 하이라이트, 장기 추적 후기 조합이 전환율이 높은 구조로 보입니다.',
      '기업 뉴스룸과 SNS를 연결해 메시지를 증폭시키는 패턴이 강합니다.',
    ],
    insight: 'CLASSYS는 제품 기능 설명보다 시술 맥락과 결과 해석을 전달하는 콘텐츠 비중을 더 높일 여지가 있습니다.',
    sourceLinks: [
      { title: 'Allergan Aesthetics Newsroom', url: 'https://www.allerganaesthetics.com/newsroom', source: 'Allergan' },
      { title: 'Galderma News', url: 'https://www.galderma.com/news', source: 'Galderma' },
      { title: 'Merz Aesthetics', url: 'https://www.merz-aesthetics.com/', source: 'Merz' },
    ],
  },
  {
    key: 'influencer',
    icon: <Users className="h-5 w-5" />,
    label: 'KOL & Influencer',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    count: 11,
    highlights: [
      '의사 본인이 출연하는 리얼 케이스 콘텐츠가 여전히 신뢰를 가장 잘 만듭니다.',
      '미국은 교육형 숏폼, 한국은 시술 전후 설명형 콘텐츠, 동남아는 후기 중심 구조가 강합니다.',
      'KOL 네트워크는 단순 노출보다 학회, 웨비나, 현장 데모와 묶였을 때 효율이 높습니다.',
    ],
    insight: '시장별 KOL 운영 방식이 달라서 동일한 메시지를 글로벌 공통 템플릿으로 가져가면 효율이 떨어질 수 있습니다.',
    sourceLinks: [
      { title: 'Dr. Shereene Idriss', url: 'https://www.instagram.com/shereeneidriss/', source: 'Instagram' },
      { title: 'DermDoctor', url: 'https://www.tiktok.com/@dermdoctor', source: 'TikTok' },
      { title: 'Influencer Marketing Hub', url: 'https://www.influencermarketinghub.com/', source: 'IMH' },
    ],
  },
  {
    key: 'events',
    icon: <CalendarDays className="h-5 w-5" />,
    label: 'Events & Congress',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    count: 4,
    highlights: [
      'AMWC, ASLMS, IMCAS Asia, MEDICA가 리프팅 카테고리 관점의 우선 추적 이벤트입니다.',
      '학술 프로그램뿐 아니라 부스 위치, 데모 방식, 파트너 미팅 구조를 같이 봐야 경쟁 해석이 가능합니다.',
      '행사 후 뉴스룸과 SNS 후속 콘텐츠의 길이와 톤도 브랜드 전략 차이를 보여줍니다.',
    ],
    insight: '이벤트는 단발성 참가보다 행사 전후 콘텐츠 운영과 파트너 팔로업이 중요합니다.',
    sourceLinks: [
      { title: 'AMWC Monaco', url: 'https://www.amwc-conference.com/', source: 'AMWC' },
      { title: 'ASLMS', url: 'https://www.aslms.org/annualconference', source: 'ASLMS' },
      { title: 'MEDICA', url: 'https://www.medica-tradefair.com/', source: 'MEDICA' },
    ],
  },
  {
    key: 'policy',
    icon: <Shield className="h-5 w-5" />,
    label: 'Global Policy',
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200',
    count: 4,
    highlights: [
      '미국, 유럽, 한국 모두 임상 근거와 사후 모니터링 요구가 강화되는 방향입니다.',
      'AI가 붙는 제품은 기능 변경 관리 계획과 설명 책임이 점점 중요해집니다.',
      '광고 표현과 before/after 사용 규제가 국가별로 크게 다르므로 마케팅 팀과 인허가 팀의 연결이 필요합니다.',
    ],
    insight: '시장 조사 화면에서도 규제 변화는 제품 출시 일정과 마케팅 표현 가능 범위에 직접 연결된다는 전제를 유지해야 합니다.',
    sourceLinks: [
      { title: 'FDA Medical Devices', url: 'https://www.fda.gov/medical-devices', source: 'FDA' },
      { title: 'European Commission Medical Devices', url: 'https://health.ec.europa.eu/medical-devices-sector_en', source: 'EU' },
      { title: 'MFDS Medical Devices', url: 'https://www.mfds.go.kr/eng/index.do', source: 'MFDS' },
    ],
  },
]

const TRENDING_TAGS = [
  { tag: '#HIFU', count: 4820 },
  { tag: '#MedicalAesthetics', count: 3910 },
  { tag: '#SaMD', count: 2640 },
  { tag: '#KOLMarketing', count: 2180 },
  { tag: '#MEDICA2026', count: 1950 },
  { tag: '#RFLifting', count: 1420 },
  { tag: '#Thermage', count: 1210 },
  { tag: '#FDAApproval', count: 870 },
]

const TOP_SOURCES = [
  { name: 'CLASSYS', url: 'https://classys.com/' },
  { name: 'Merz Aesthetics', url: 'https://www.merz-aesthetics.com/' },
  { name: 'Solta Medical', url: 'https://www.soltamedical.com/' },
  { name: 'Lutronic', url: 'https://www.lutronic.com/us/' },
  { name: 'Jeisys', url: 'https://www.jeisys.com/eng/' },
  { name: 'FDA', url: 'https://www.fda.gov/medical-devices' },
  { name: 'MedTech Europe', url: 'https://www.medtecheurope.org/' },
]

export default function DailyReportClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('report')
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED)
  const [detailCard, setDetailCard] = useState<DomainCard | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const now = new Date()
    setLastUpdated(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setRefreshing(false)
  }

  async function handleExportPDF() {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const { default: jsPDF } = await import('jspdf')
      const element = reportRef.current
      const dataUrl = await toPng(element, { pixelRatio: 2, cacheBust: true })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgWidth = 210
      const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth
      const pageHeight = 297
      let y = 0
      while (y < imgHeight) {
        if (y > 0) pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, -y, imgWidth, imgHeight)
        y += pageHeight
      }
      pdf.save(`Market_Intelligence_${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  const tabs = [
    { key: 'report' as const, label: 'Daily Report', icon: <FileText className="h-4 w-4" /> },
    { key: 'globe' as const, label: 'Market Map', icon: <Map className="h-4 w-4" /> },
    { key: 'charts' as const, label: 'Charts', icon: <BarChart2 className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-full bg-white">
      <MarketNav />

      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#002D74_0%,#0084C9_100%)] px-6 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-100">
                <Globe className="h-4 w-4" />
                <span>Global Medical Aesthetics Intelligence</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{REPORT_DATE} Daily Report</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100">
                글로벌 의료미용 장비 시장에서 제품, 규제, KOL, 이벤트, 마케팅 신호를 한 화면에서 정리한 운영용 대시보드입니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportPDF}
                disabled={exporting || activeTab !== 'report'}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/20 disabled:opacity-40"
              >
                <Download className={['h-4 w-4', exporting ? 'animate-bounce' : ''].join(' ')} />
                {exporting ? 'Exporting PDF...' : 'Export PDF'}
              </button>
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
            <span className="text-blue-300">|</span>
            <span>Auto refresh every hour</span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-7xl overflow-x-auto px-6">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === key
                  ? 'border-[#002D74] bg-white text-[#002D74]'
                  : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-700',
              ].join(' ')}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'report' ? (
        <div ref={reportRef} className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'Signals tracked', value: '38' },
              { label: 'Technology / AI', value: '13' },
              { label: 'Marketing', value: '6' },
              { label: 'KOL watch items', value: '11' },
              { label: 'Events', value: '4' },
              { label: 'Policy alerts', value: '4' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
                <p className="text-3xl font-bold tracking-tight text-[#002D74]">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {DOMAIN_CARDS.map((card) => (
              <article key={card.key} className={`rounded-3xl border p-5 ${card.bg}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={card.color}>{card.icon}</span>
                    <div>
                      <h2 className={`text-base font-bold ${card.color}`}>{card.label}</h2>
                      <p className="text-xs text-slate-500">Signals: {card.count}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailCard(card)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source links
                  </button>
                </div>

                <div className="space-y-2">
                  {card.highlights.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-white/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Business interpretation</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{card.insight}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Trending tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {TRENDING_TAGS.map(({ tag, count }, index) => (
                <span
                  key={tag}
                  className={[
                    'rounded-full border px-3 py-1 text-sm transition',
                    index < 3 ? 'font-semibold' : 'font-medium',
                  ].join(' ')}
                  style={{
                    borderColor: '#93c5fd',
                    color: '#002D74',
                    background: `rgba(59, 130, 246, ${0.08 + (8 - index) * 0.02})`,
                  }}
                >
                  {tag}
                  <span className="ml-1.5 text-xs text-slate-400">{count.toLocaleString()}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Core sources</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOP_SOURCES.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  {source.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'globe' ? (
        <div className="flex-1 bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="mx-auto w-full max-w-7xl">
              <h2 className="text-base font-bold text-slate-950">Global market map</h2>
              <p className="mt-1 text-sm text-slate-500">지역별 시장 규모, 성장률, 대표 장비 카테고리를 같이 보는 참고 화면입니다.</p>
            </div>
          </div>
          <WorldMap />
        </div>
      ) : null}

      {activeTab === 'charts' ? (
        <div className="flex-1 bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="mx-auto w-full max-w-7xl">
              <h2 className="text-base font-bold text-slate-950">Data charts</h2>
              <p className="mt-1 text-sm text-slate-500">시장 규모, 카테고리 구성, 지역별 성장 축을 시각적으로 확인하는 화면입니다.</p>
            </div>
          </div>
          <MarketCharts />
        </div>
      ) : null}

      {detailCard ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setDetailCard(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className={`p-5 ${detailCard.bg}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={detailCard.color}>{detailCard.icon}</span>
                  <div>
                    <h2 className={`text-base font-bold ${detailCard.color}`}>{detailCard.label}</h2>
                    <p className="text-xs text-slate-500">{detailCard.sourceLinks.length} source links</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailCard(null)}
                  className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-3 p-5">
              {detailCard.sourceLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{link.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{link.source}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
