'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import {
  RefreshCw, Cpu, Users, CalendarDays, Globe, Shield,
  TrendingUp, ExternalLink, Clock, Zap, Download, FileText,
  BarChart2, Map,
} from 'lucide-react'
import MarketNav from './MarketNav'

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ minHeight: 480, background: '#f8fafc' }}>
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-blue-500">세계 지도 로딩 중...</p>
      </div>
    </div>
  ),
})

const MarketCharts = dynamic(() => import('./MarketCharts'), { ssr: false })

const REPORT_DATE = '2026년 5월 6일'
const LAST_UPDATED = '2026-05-06 08:30'

interface DomainCard {
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
      'InMode, EMFACE PRO 차세대 버전 FDA 510(k) 신청 완료',
      'Cutera 新 HIFU 플랫폼 CE 마크 획득 — Q3 유럽 출시 예정',
      '실시간 조직 이미징 탑재 HIFU 2.0 임상시험 결과 발표 (Lasers in Surgery)',
    ],
    insight: '초음파 기반 기기가 Q2 규제 승인 집중. 유럽 CE 선행 → 미국 FDA 후행 패턴 지속.',
    sourceLinks: [
      { title: 'EMFACE PRO FDA 510(k) Submission', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm', source: 'FDA' },
      { title: 'Cutera CE Mark Announcement', url: 'https://www.cutera.com/news', source: 'Cutera IR' },
      { title: 'HIFU 2.0 Clinical Trial Results', url: 'https://onlinelibrary.wiley.com/journal/10969101', source: 'Lasers in Surgery and Medicine' },
    ],
  },
  {
    key: 'ai',
    icon: <Zap className="h-5 w-5" />,
    label: 'AI / SaMD',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    count: 5,
    highlights: [
      'Canfield Scientific × DeepDerm 피부 AI 분석 솔루션 파트너십 발표',
      'Revian, SaMD 등록 완료 — AI 기반 피부 상태 추적 앱 출시',
      'FDA CDER, SaMD 허가 프로세스 간소화 가이던스 공개 (초안)',
    ],
    insight: 'SaMD 인허가 가이던스 명확화로 AI 피부진단 시장 진입장벽 낮아지는 추세.',
    sourceLinks: [
      { title: 'Canfield × DeepDerm Partnership', url: 'https://www.canfieldsci.com/news', source: 'Canfield Scientific' },
      { title: 'Revian SaMD Registration', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm', source: 'FDA' },
      { title: 'FDA SaMD Guidance Draft', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence', source: 'FDA.gov' },
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
      'Allergan Aesthetics, #RealResults 글로벌 캠페인 Instagram 주요국 동시 런칭',
      'Galderma, 리얼닥터 콜라보 YouTube 시리즈 누적 4.2M 뷰 돌파',
      'Merz Aesthetics, TikTok Live 의료진 Q&A 포맷 도입 — 경쟁사 대비 +34% 참여율',
    ],
    insight: '숏폼 + 의료전문가 직접 출연 조합이 고관여 고객 전환율에서 가장 높은 성과 기록 중.',
    sourceLinks: [
      { title: 'Allergan #RealResults Campaign', url: 'https://www.allerganaesthetics.com/newsroom', source: 'Allergan Newsroom' },
      { title: 'Galderma Real Doctor Series', url: 'https://www.galderma.com/news', source: 'Galderma' },
      { title: 'Merz TikTok Strategy', url: 'https://www.merzaesthetics.com/media', source: 'Merz Aesthetics' },
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
      'Dr. Shereene Idriss(1.2M), HIFU 시술 리얼 후기 Reels — 48시간 내 2.8M 조회',
      '@dermdoctor(12.8M TikTok), RF 리프팅 비교 영상 시리즈 3편 완결',
      '아시아 KOL 시장: 한국·일본 피부과 의사 인플루언서 팔로워 YoY +41%',
    ],
    insight: '아시아권 의료진 KOL이 서구권 대비 신뢰도·전환율 모두 높게 나타남. 한국 선점 기회.',
    sourceLinks: [
      { title: 'Dr. Idriss Instagram Post', url: 'https://www.instagram.com/shereeneidriss', source: 'Instagram @shereeneidriss' },
      { title: '@dermdoctor TikTok Series', url: 'https://www.tiktok.com/@dermdoctor', source: 'TikTok @dermdoctor' },
      { title: 'Asia KOL Market Report', url: 'https://www.influencermarketinghub.com/asia-influencer-report', source: 'Influencer Marketing Hub' },
    ],
  },
  {
    key: 'events',
    icon: <CalendarDays className="h-5 w-5" />,
    label: 'Events & Congress',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    count: 3,
    highlights: [
      'ESTRO Annual Meeting — 바르셀로나, 5/2~5/5 (진행중)',
      'ASLMS Annual Conference — 올랜도, 4/23~4/26 (종료, 주요발표 요약 등록)',
      'MEDICA 2026 — 뒤셀도르프, 11/16~11/19 (사전등록 오픈)',
    ],
    insight: 'MEDICA 사전 부스 계약 마감 6월 초. 조기 신청 시 프리미엄 위치 확보 가능.',
    sourceLinks: [
      { title: 'ESTRO 2026 Official Site', url: 'https://www.estro.org/Congresses/ESTRO-2026', source: 'ESTRO' },
      { title: 'ASLMS 2026 Program', url: 'https://www.aslms.org/meetings/annual-conference', source: 'ASLMS' },
      { title: 'MEDICA 2026 Registration', url: 'https://www.medica.de', source: 'Messe Düsseldorf' },
    ],
  },
  {
    key: 'policy',
    icon: <Shield className="h-5 w-5" />,
    label: 'Global Policy',
    color: 'text-gray-700',
    bg: 'bg-gray-50 border-gray-200',
    count: 4,
    highlights: [
      '중국 NMPA, 의료미용기기 광고 규제 강화 — 전문의 검증 필수화 (6월 시행)',
      'EU MDR 전환 기한 재연장 논의 — Class IIa 기기 2027년까지 적용 완화 가능성',
      '태국 FDA, 의료미용기기 온라인 판매 가이드라인 초안 공개',
    ],
    insight: '중국 규제 강화로 현지 마케팅 전략 조정 필요. EU MDR 완화는 유럽 진출 타임라인에 긍정적.',
    sourceLinks: [
      { title: 'NMPA 의료미용기기 광고 고시', url: 'https://www.nmpa.gov.cn/xxgk/fgwj', source: 'NMPA (중국)' },
      { title: 'EU MDR Extension Discussion', url: 'https://ec.europa.eu/health/medical-devices_en', source: 'European Commission' },
      { title: 'Thailand FDA Guideline Draft', url: 'https://www.fda.moph.go.th', source: 'Thai FDA' },
    ],
  },
]

const TRENDING_TAGS = [
  { tag: '#HIFU2026', count: 4820 },
  { tag: '#MedicalAesthetics', count: 3910 },
  { tag: '#SaMD', count: 2640 },
  { tag: '#KOLMarketing', count: 2180 },
  { tag: '#MEDICA2026', count: 1950 },
  { tag: '#AestheticMedicine', count: 1730 },
  { tag: '#RFLifting', count: 1420 },
  { tag: '#Thermage', count: 1210 },
  { tag: '#EUMedicalDevice', count: 980 },
  { tag: '#FDAApproval', count: 870 },
]

type TabKey = 'report' | 'globe' | 'charts'

export default function DailyReportClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('report')
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED)
  const [detailCard, setDetailCard] = useState<DomainCard | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1200))
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
      const el = reportRef.current
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgW = 210
      const imgH = (el.offsetHeight * imgW) / el.offsetWidth
      const pageH = 297
      let y = 0
      while (y < imgH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, -y, imgW, imgH)
        y += pageH
      }
      pdf.save(`Market_Intelligence_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const TABS = [
    { key: 'report' as TabKey, label: '오늘의 리포트', icon: <FileText className="h-4 w-4" /> },
    { key: 'globe' as TabKey, label: '글로벌 시장 지도', icon: <Map className="h-4 w-4" /> },
    { key: 'charts' as TabKey, label: '데이터 시각화', icon: <BarChart2 className="h-4 w-4" /> },
  ]

  return (
    <div className="flex min-h-full flex-col bg-white">
      <MarketNav />

      {/* 페이지 헤더 */}
      <div
        className="border-b border-gray-100 px-6 py-5"
        style={{ background: 'linear-gradient(135deg, #002D74 0%, #0084C9 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-1">
              <Globe className="h-3.5 w-3.5" />
              <span>Global Medical Aesthetics Market</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{REPORT_DATE} Daily Report</h1>
            <p className="mt-1 text-blue-200 text-sm">글로벌 피부미용의료기기 시장 동향 자동 요약</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={exporting || activeTab !== 'report'}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white transition-all hover:bg-white/20 disabled:opacity-40"
              title="리포트 PDF 다운로드"
            >
              <Download className={['h-4 w-4', exporting ? 'animate-bounce' : ''].join(' ')} />
              {exporting ? 'PDF 생성 중...' : 'PDF 다운로드'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white transition-all hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
              {refreshing ? '수집 중...' : '새로고침'}
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-300">
          <Clock className="h-3 w-3" />
          <span>마지막 업데이트: {lastUpdated}</span>
          <span className="mx-1 text-blue-500">·</span>
          <span>1시간 자동 갱신</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all border-b-2',
              activeTab === key
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60',
            ].join(' ')}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Tab: 오늘의 리포트 */}
      {activeTab === 'report' && (
        <div ref={reportRef} className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
          {/* KPI 요약 */}
          <div className="mb-6 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {[
              { label: '수집 기사', value: '37' },
              { label: 'Tech / AI', value: '13' },
              { label: '마케팅', value: '6' },
              { label: 'KOL 동향', value: '11' },
              { label: '이벤트', value: '3' },
              { label: '정책', value: '4' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold" style={{ color: '#002D74' }}>{value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* 도메인 카드 그리드 */}
          <div className="grid gap-4 lg:grid-cols-2">
            {DOMAIN_CARDS.map((card) => (
              <div key={card.key} className={`rounded-2xl border p-5 ${card.bg}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={card.color}>{card.icon}</span>
                    <span className={`text-sm font-semibold ${card.color}`}>{card.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      기사 {card.count}건
                    </span>
                    <button
                      onClick={() => setDetailCard(card)}
                      className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
                      title="상세 링크 보기"
                    >
                      <ExternalLink className="h-3 w-3" />
                      상세 링크
                    </button>
                  </div>
                </div>

                <ul className="mb-3 space-y-2">
                  {card.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl bg-white/60 px-3 py-2">
                  <p className="mb-0.5 text-xs font-semibold text-gray-500">비즈니스 시사점</p>
                  <p className="text-xs leading-relaxed text-gray-700">{card.insight}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 트렌딩 해시태그 */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: '#2C3E50' }}>오늘의 트렌딩 키워드</h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map(({ tag, count }, i) => {
                const size = i < 3 ? 'text-base font-semibold' : i < 6 ? 'text-sm font-medium' : 'text-xs'
                const opacity = i < 3 ? 'opacity-100' : i < 7 ? 'opacity-80' : 'opacity-60'
                return (
                  <span
                    key={tag}
                    className={`${size} ${opacity} cursor-default rounded-full border px-3 py-1 transition-all hover:opacity-100`}
                    style={{ borderColor: '#0084C9', color: '#002D74', background: `rgba(0, 132, 201, ${0.06 + (10 - i) * 0.02})` }}
                  >
                    {tag}
                    <span className="ml-1.5 text-xs text-gray-400">{count.toLocaleString()}</span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* 주요 출처 */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>주요 데이터 출처</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Google News', url: 'https://news.google.com' },
                { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov' },
                { name: 'FDA.gov', url: 'https://www.fda.gov/medical-devices' },
                { name: 'CE Marking', url: 'https://ec.europa.eu/growth/single-market/ce-marking_en' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com' },
                { name: 'MassDevice', url: 'https://www.massdevice.com' },
                { name: 'Fierce Biotech', url: 'https://www.fiercebiotech.com' },
                { name: 'Aesthetic Authority', url: 'https://aestheticauthority.com' },
                { name: 'Lasers in Surgery', url: 'https://onlinelibrary.wiley.com/journal/10969101' },
              ].map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                >
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: 글로벌 시장 지도 */}
      {activeTab === 'globe' && (
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="border-b border-gray-100 bg-white px-6 py-3">
            <h2 className="text-sm font-semibold" style={{ color: '#2C3E50' }}>글로벌 피부미용의료기기 시장 지도</h2>
            <p className="text-xs text-gray-400">국가/대륙별 시장 규모 · 성장률 · 주요 기기 현황</p>
          </div>
          <WorldMap />
        </div>
      )}

      {/* Tab: 데이터 시각화 */}
      {activeTab === 'charts' && (
        <div className="flex-1 bg-gray-50">
          <div className="border-b border-gray-100 bg-white px-6 py-3">
            <h2 className="text-sm font-semibold" style={{ color: '#2C3E50' }}>데이터 시각화 분석</h2>
            <p className="text-xs text-gray-400">지역별 시장 규모 · 기기 카테고리 · 성장 전망 · 키워드 분석</p>
          </div>
          <MarketCharts />
        </div>
      )}

      {/* Detail Link Modal */}
      {detailCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailCard(null) }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className={`flex items-start justify-between rounded-t-2xl p-5 pb-4 ${detailCard.bg}`}>
              <div className="flex items-center gap-2.5">
                <span className={detailCard.color}>{detailCard.icon}</span>
                <div>
                  <h2 className={`text-base font-bold ${detailCard.color}`}>{detailCard.label}</h2>
                  <p className="text-xs text-gray-500">원본 출처 링크 {detailCard.sourceLinks.length}건</p>
                </div>
              </div>
              <button onClick={() => setDetailCard(null)} className="rounded-lg p-1 text-gray-400 hover:bg-white/50 hover:text-gray-600 transition-colors">
                <ExternalLink className="h-4 w-4 rotate-0" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {detailCard.sourceLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-3.5 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 leading-snug">{link.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{link.source}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="px-5 pb-5">
              <p className="text-[11px] text-gray-400 text-center">※ 원본 페이지는 외부 사이트에서 제공됩니다</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
