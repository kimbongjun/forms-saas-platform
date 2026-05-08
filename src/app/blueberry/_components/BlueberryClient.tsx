'use client'

import React, { useState, useRef, useEffect, useTransition } from 'react'
import {
  Search, TrendingUp, FileText, MessageSquare, RefreshCw, Grape,
  Download, Monitor, Smartphone, Calendar, Plus, X, Info, Wifi, WifiOff, Copy, Check,
  Bookmark, BookmarkCheck, Image as ImageIcon, TrendingDown,
  ArrowUpRight, BarChart3, ExternalLink, Flame, LayoutGrid, Loader2, Sparkles, Trophy,
} from 'lucide-react'
import DatalabForm from './DatalabForm'
import WordCloudView from './WordCloudView'

interface NaverRelatedKeyword {
  keyword: string
  monthlyPc: number
  monthlyMobile: number
  relevanceScore: number
}

interface NaverKeywordResult {
  monthlyPcQcCnt: number | null
  monthlyMobileQcCnt: number | null
  contentByPlatform: {
    blog: number
    cafe: number
    news: number
    kin: number
    shop: number
  }
  relatedKeywords: NaverRelatedKeyword[]
  fetchedAt: string
}

interface GoogleTrendsResult {
  interestOverTime: { month: string; value: number }[]
  relatedQueries: { query: string; value: number }[]
  fetchedAt: string
}

interface RelatedKeywordData {
  monthlyPc: number | null
  monthlyMobile: number | null
  blogCount: number
  /** avg(최근30일) / avg(이전30일). 1.0=변화없음, >1=상승 */
  trendRatio: number
}

type RelatedKeywordMap = Record<string, RelatedKeywordData>

interface SmartBlockPost {
  title: string
  link: string
  description: string
  bloggername: string
  postdate: string
}

interface SmartBlockResult {
  topic: string
  total: number
  posts: SmartBlockPost[]
}

interface DatalabResponse {
  results?: {
    title: string
    data: { period: string; ratio: number }[]
  }[]
  error?: string
}

interface RankedKeyword {
  keyword: string
  displayVolume: number
  sourceValue: number
  metrics: RelatedKeywordData | null
}

class WordcloudErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  componentDidUpdate(prevProps: { children: React.ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function normalizeKeyword(value: string) {
  return value.trim().normalize('NFC')
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('ko-KR').format(Math.round(value))
}

function formatPercent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`
}

function formatTrendRatio(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  const diff = Math.round((value - 1) * 100)
  if (diff > 0) return `+${diff}%`
  return `${diff}%`
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json = (await response.json()) as T & { error?: string; detail?: string }
  if (!response.ok || json.error) {
    throw new Error(json.error ?? `Request failed: ${response.status}`)
  }

  return json
}

function getLast12MonthsRange() {
  const today = new Date()
  const start = new Date(today)
  start.setFullYear(start.getFullYear() - 1)

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10),
  }
}

function getTopChannel(contentByPlatform: NaverKeywordResult['contentByPlatform']) {
  const entries = Object.entries(contentByPlatform)
  const top = entries.sort((a, b) => b[1] - a[1])[0]
  if (!top) return null

  const labelMap: Record<string, string> = {
    blog: '블로그',
    cafe: '카페',
    news: '뉴스',
    kin: '지식iN',
    shop: '쇼핑',
  }

  return {
    label: labelMap[top[0]] ?? top[0],
    count: top[1],
  }
}

function buildRelatedKeywords(
  platform: Platform,
  keyword: string,
  naverData: NaverKeywordResult | null,
  googleData: GoogleTrendsResult | null,
  relatedMap: RelatedKeywordMap,
) {
  if (platform === 'naver' && naverData) {
    const base = naverData.relatedKeywords.map((item) => {
      const normalized = normalizeKeyword(item.keyword)
      const metrics = relatedMap[normalized] ?? null
      const sourceValue = item.monthlyPc + item.monthlyMobile
      const displayVolume = metrics?.monthlyPc != null && metrics.monthlyMobile != null
        ? metrics.monthlyPc + metrics.monthlyMobile
        : sourceValue

      return {
        keyword: item.keyword,
        displayVolume,
        sourceValue,
        metrics,
      } satisfies RankedKeyword
    })

    return base.sort((a, b) => {
      const scoreGap = (b.metrics?.relevanceScore ?? 0) - (a.metrics?.relevanceScore ?? 0)
      if (scoreGap !== 0) return scoreGap
      return b.displayVolume - a.displayVolume
    })
  }

  if (platform === 'google' && googleData) {
    const base = googleData.relatedQueries.map((item) => {
      const normalized = normalizeKeyword(item.query)
      const metrics = relatedMap[normalized] ?? null
      const estimated = metrics?.monthlyPc != null && metrics.monthlyMobile != null
        ? metrics.monthlyPc + metrics.monthlyMobile
        : item.value * 100

      return {
        keyword: item.query,
        displayVolume: estimated,
        sourceValue: item.value,
        metrics,
      } satisfies RankedKeyword
    })

    return base.sort((a, b) => {
      const scoreGap = (b.metrics?.relevanceScore ?? 0) - (a.metrics?.relevanceScore ?? 0)
      if (scoreGap !== 0) return scoreGap
      return b.displayVolume - a.displayVolume
    })
  }

  return [] as RankedKeyword[]
}

function SectionHeading({
  icon,
  title,
  description,
  actions,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#002D74]/8 text-[#002D74]">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      {actions}
    </div>
  )
}

function StatCard({
  label,
  value,
  helper,
  accent = 'blue',
}: {
  label: string
  value: string
  helper: string
  accent?: 'blue' | 'green' | 'amber' | 'rose'
}) {
  const accentStyles = {
    blue: 'bg-[#002D74]/7 text-[#002D74]',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${accentStyles[accent]}`}>
        {label}
      </span>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{helper}</p>
    </div>
  )
}

function DistributionList({
  items,
  emptyLabel,
}: {
  items: { label: string; value: number; color: string }[]
  emptyLabel: string
}) {
  if (items.length === 0) {
    return <p className="rounded-2xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">{emptyLabel}</p>
  }

  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const width = total > 0 ? `${Math.max(8, Math.round((item.value / total) * 100))}%` : '8%'
        return (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
              <span className="font-medium text-gray-900">{formatNumber(item.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full" style={{ width, backgroundColor: item.color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrendChart({
  title,
  points,
  color,
  valueLabel,
}: {
  title: string
  points: { label: string; value: number }[]
  color: string
  valueLabel: string
}) {
  if (points.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center text-sm text-gray-400">
        차트 데이터를 아직 불러오지 못했습니다.
      </div>
    )
  }

  const width = 720
  const height = 280
  const padding = { top: 18, right: 18, bottom: 32, left: 40 }
  const values = points.map((point) => point.value)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const valueRange = Math.max(maxValue - minValue, 1)

  const getX = (index: number) =>
    padding.left + (index / Math.max(points.length - 1, 1)) * (width - padding.left - padding.right)
  const getY = (value: number) =>
    padding.top + (1 - (value - minValue) / valueRange) * (height - padding.top - padding.bottom)

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`)
    .join(' ')

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${height - padding.bottom} L ${getX(0)} ${
    height - padding.bottom
  } Z`

  const axisTicks = 4
  const labels = points.filter((_, index) => {
    const step = Math.max(1, Math.ceil(points.length / 6))
    return index % step === 0 || index === points.length - 1
  })

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{valueLabel}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="blueberry-trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {Array.from({ length: axisTicks + 1 }).map((_, index) => {
          const value = minValue + (valueRange / axisTicks) * index
          const y = getY(value)
          return (
            <g key={index}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E5E7EB" strokeWidth="1" />
              <text x={padding.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#9CA3AF">
                {Math.round(value)}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#blueberry-trend-fill)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((point, index) => (
          <circle key={point.label} cx={getX(index)} cy={getY(point.value)} r="3.5" fill={color} />
        ))}
      </svg>

      <div className="mt-3 flex justify-between gap-2 overflow-hidden text-[11px] text-gray-400">
        {labels.map((item) => (
          <span key={item.label} className="truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── 경쟁도 ───────────────────────────────────────────────────────
const COMP_STYLE = {
  high: 'bg-red-50 text-red-600',
  mid: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-700',
}
const COMP_LABEL = { high: '경쟁 높음', mid: '경쟁 보통', low: '경쟁 낮음' }

type Platform = 'naver' | 'google'

// trendRatio → competition 변환 (WordCloudView용)
function trendToCompetition(trendRatio: number | undefined): 'high' | 'mid' | 'low' {
  const r = trendRatio ?? 1
  if (r >= 1.3) return 'high'
  if (r >= 1.0) return 'mid'
  return 'low'
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function BlueberryClient() {
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [platform, setPlatform] = useState<Platform>('naver')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [smartBlockLoading, setSmartBlockLoading] = useState(false)
  const [relatedView, setRelatedView] = useState<'table' | 'cloud'>('table')
  const [showAllRelated, setShowAllRelated] = useState(false)
  const [naverData, setNaverData] = useState<NaverKeywordResult | null>(null)
  const [googleData, setGoogleData] = useState<GoogleTrendsResult | null>(null)
  const [relatedMap, setRelatedMap] = useState<RelatedKeywordMap>({})
  const [smartBlocks, setSmartBlocks] = useState<SmartBlockResult[]>([])
  const [trendPoints, setTrendPoints] = useState<{ label: string; value: number }[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (!keyword) {
      setError(null)
      setNaverData(null)
      setGoogleData(null)
      setRelatedMap({})
      setSmartBlocks([])
      setTrendPoints([])
      return
    }

    let active = true

    async function loadKeyword() {
      setLoading(true)
      setRelatedLoading(true)
      setSmartBlockLoading(platform === 'naver')
      setError(null)
      setNaverData(null)
      setGoogleData(null)
      setRelatedMap({})
      setSmartBlocks([])
      setTrendPoints([])

      try {
        if (platform === 'naver') {
          const keywordResult = await postJson<NaverKeywordResult>('/api/blueberry/naver', { keyword })
          if (!active) return
          setNaverData(keywordResult)

          const candidateKeywords = keywordResult.relatedKeywords.map((item) => normalizeKeyword(item.keyword)).filter(Boolean)
          const { startDate, endDate } = getLast12MonthsRange()

          const [relatedResult, smartBlockResult, datalabResult] = await Promise.all([
            candidateKeywords.length > 0
              ? postJson<RelatedKeywordMap>('/api/blueberry/related-keywords', {
                  keywords: candidateKeywords,
                })
              : Promise.resolve({}),
            postJson<SmartBlockResult[]>('/api/blueberry/smart-block', {
              keyword,
              subTopics: keywordResult.relatedKeywords.slice(0, 4).map((item) => item.keyword),
            }).catch(() => []),
            postJson<DatalabResponse>('/api/blueberry/datalab', {
              startDate,
              endDate,
              timeUnit: 'month',
              keywordGroups: [{ groupName: keyword, keywords: [keyword] }],
            }).catch(() => ({ results: [] })),
          ])

          if (!active) return
          setRelatedMap(relatedResult)
          setSmartBlocks(smartBlockResult)
          setTrendPoints(
            (datalabResult.results?.[0]?.data ?? []).map((item) => ({
              label: item.period.slice(0, 7),
              value: item.ratio,
            })),
          )
        } else {
          const keywordResult = await postJson<GoogleTrendsResult>('/api/blueberry/google', { keyword })
          if (!active) return
          setGoogleData(keywordResult)
          setTrendPoints(
            keywordResult.interestOverTime.map((item) => ({
              label: item.month,
              value: item.value,
            })),
          )

          const candidateKeywords = keywordResult.relatedQueries.map((item) => normalizeKeyword(item.query)).filter(Boolean)
          const relatedResult = candidateKeywords.length > 0
            ? await postJson<RelatedKeywordMap>('/api/blueberry/related-keywords', {
                keywords: candidateKeywords,
              })
            : {}

          if (!active) return
          setRelatedMap(relatedResult)
        }
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : '데이터를 불러오지 못했습니다.')
      } finally {
        if (!active) return
        setLoading(false)
        setRelatedLoading(false)
        setSmartBlockLoading(false)
      }
    }

    void loadKeyword()

    return () => {
      active = false
    }
  }, [keyword, platform])

  const relatedKeywords = React.useMemo(
    () => buildRelatedKeywords(platform, keyword, naverData, googleData, relatedMap),
    [platform, keyword, naverData, googleData, relatedMap],
  )

  const displayedRelatedKeywords = React.useMemo(
    () => (showAllRelated ? relatedKeywords : relatedKeywords.slice(0, 7)),
    [relatedKeywords, showAllRelated],
  )

  const cloudWords = React.useMemo(
    () =>
      relatedKeywords.slice(0, 20).map((item) => ({
        text: item.keyword,
        value: Math.max(1, item.displayVolume),
        competition: trendToCompetition(item.metrics?.trendRatio),
      })),
    [relatedKeywords],
  )

  const topChannel = naverData ? getTopChannel(naverData.contentByPlatform) : null
  const totalContentCount = naverData
    ? Object.values(naverData.contentByPlatform).reduce((sum, value) => sum + value, 0)
    : 0
  const totalSearchVolume = naverData && naverData.monthlyPcQcCnt != null && naverData.monthlyMobileQcCnt != null
    ? naverData.monthlyPcQcCnt + naverData.monthlyMobileQcCnt
    : null
  const mobileShare = totalSearchVolume && naverData?.monthlyMobileQcCnt != null
    ? naverData.monthlyMobileQcCnt / totalSearchVolume
    : null

  const googleAverageInterest = googleData && googleData.interestOverTime.length > 0
    ? Math.round(
        googleData.interestOverTime.reduce((sum, item) => sum + item.value, 0) / googleData.interestOverTime.length,
      )
    : null
  const googlePeakInterest = googleData && googleData.interestOverTime.length > 0
    ? Math.max(...googleData.interestOverTime.map((item) => item.value))
    : null

  const contentDistribution = naverData
    ? [
        { label: '블로그', value: naverData.contentByPlatform.blog, color: '#03C75A' },
        { label: '카페', value: naverData.contentByPlatform.cafe, color: '#FB923C' },
        { label: '뉴스', value: naverData.contentByPlatform.news, color: '#2563EB' },
        { label: '지식iN', value: naverData.contentByPlatform.kin, color: '#FACC15' },
        { label: '쇼핑', value: naverData.contentByPlatform.shop, color: '#A855F7' },
      ]
    : []

  const deviceDistribution = naverData && totalSearchVolume
    ? [
        { label: '모바일', value: naverData.monthlyMobileQcCnt ?? 0, color: '#002D74' },
        { label: 'PC', value: naverData.monthlyPcQcCnt ?? 0, color: '#60A5FA' },
      ]
    : []

  const searchSuggestions = ['울쎄라', '써마지', '슈링크', '볼뉴머', '리쥬란', '인모드']

  function handleSearch(nextKeyword = input) {
    const normalized = normalizeKeyword(nextKeyword)
    if (!normalized) return
    setInput(normalized)
    setShowAllRelated(false)
    startTransition(() => {
      setKeyword(normalized)
    })
  }

  function handleCopy() {
    if (!keyword) return
    void navigator.clipboard.writeText(keyword)
    setCopied(true)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-[#D7E1F5] bg-[linear-gradient(135deg,#002D74_0%,#0A4AA8_55%,#DDE8F9_160%)] p-6 text-white shadow-[0_18px_45px_rgba(0,45,116,0.18)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/88">
              <Sparkles className="h-3.5 w-3.5" />
              BLUEBERRY INTELLIGENCE
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">키워드 탐색과 트렌드 검증을 한 화면에서 정리합니다.</h1>
            <p className="mt-3 text-sm leading-6 text-white/78 sm:text-base">
              네이버 검색광고, 네이버 DataLab, Google Trends, 블로그 주제 데이터를 결합해 검색량, 포화도,
              최근 30일 상승 흐름까지 함께 봅니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Sources</p>
              <p className="mt-2 text-lg font-semibold">Naver + Google</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Ranking</p>
              <p className="mt-2 text-lg font-semibold">연관도 + 트렌드</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Output</p>
              <p className="mt-2 text-lg font-semibold">표 + 워드클라우드</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={<Search className="h-4 w-4" />}
          title="키워드 검색"
          description="플랫폼을 선택하고 핵심 키워드를 입력하면 연관 검색어와 콘텐츠 포화도를 함께 분석합니다."
        />

        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit rounded-2xl bg-gray-100 p-1">
            {([
              ['naver', 'Naver'],
              ['google', 'Google'],
            ] as [Platform, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPlatform(value)}
                className={[
                  'rounded-2xl px-4 py-2 text-sm font-semibold transition-colors',
                  platform === value ? 'bg-white text-[#002D74] shadow-sm' : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder={platform === 'naver' ? '예: 볼뉴머, 울쎄라, 슈링크' : '예: Ultherapy, Thermage'}
                className="w-full rounded-2xl border border-gray-200 bg-white px-11 py-3.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#002D74] focus:ring-4 focus:ring-[#002D74]/8"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isPending || loading}
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-2xl bg-[#002D74] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A4AA8] disabled:cursor-not-allowed disabled:bg-[#9FB5DD]"
              >
                {(isPending || loading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                분석 실행
              </button>
              {keyword ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#002D74] hover:text-[#002D74]"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '복사됨' : '복사'}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchSuggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setInput(item)
                  handleSearch(item)
                }}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#002D74] hover:bg-white hover:text-[#002D74]"
              >
                {item}
              </button>
            ))}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}
        </div>
      </section>

      {keyword ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platform === 'naver' ? (
              <>
                <StatCard
                  label="월간 검색량"
                  value={totalSearchVolume ? formatNumber(totalSearchVolume) : '연동 필요'}
                  helper={totalSearchVolume ? '네이버 광고 API 기준 PC + 모바일 합산' : '광고 API 미연동 시 추정 불가'}
                  accent="blue"
                />
                <StatCard
                  label="모바일 비중"
                  value={mobileShare !== null ? formatPercent(mobileShare, 1) : '-'}
                  helper="실제 검색 볼륨 중 모바일 비중"
                  accent="green"
                />
                <StatCard
                  label="콘텐츠 총량"
                  value={formatNumber(totalContentCount)}
                  helper="블로그, 카페, 뉴스, 지식iN, 쇼핑 노출량 합산"
                  accent="amber"
                />
                <StatCard
                  label="주요 채널"
                  value={topChannel ? topChannel.label : '-'}
                  helper={topChannel ? `${formatNumber(topChannel.count)}건으로 가장 큼` : '채널별 데이터 없음'}
                  accent="rose"
                />
              </>
            ) : (
              <>
                <StatCard
                  label="평균 관심도"
                  value={googleAverageInterest !== null ? formatNumber(googleAverageInterest) : '-'}
                  helper="최근 12개월 Google Trends 평균"
                  accent="blue"
                />
                <StatCard
                  label="최고 관심도"
                  value={googlePeakInterest !== null ? formatNumber(googlePeakInterest) : '-'}
                  helper="최근 12개월 중 최고 지점"
                  accent="green"
                />
                <StatCard
                  label="연관 쿼리 수"
                  value={formatNumber(googleData?.relatedQueries.length ?? 0)}
                  helper="Google Trends 관련 검색어 개수"
                  accent="amber"
                />
                <StatCard
                  label="분석 상태"
                  value={loading ? '로딩 중' : '실시간'}
                  helper="요청 시점 기준 최신 외부 API 결과"
                  accent="rose"
                />
              </>
            )}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <TrendChart
              title={platform === 'naver' ? 'DataLab 검색 트렌드' : 'Google 관심도 추이'}
              points={trendPoints}
              color={platform === 'naver' ? '#002D74' : '#2563EB'}
              valueLabel={platform === 'naver' ? '최근 12개월 검색 비율 추이' : '최근 12개월 Google Trends 점수'}
            />

            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-[#002D74]" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {platform === 'naver' ? '디바이스 분포' : '분석 메모'}
                  </h3>
                </div>
                {platform === 'naver' ? (
                  <DistributionList items={deviceDistribution} emptyLabel="디바이스 분포 데이터가 없습니다." />
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    Google Trends는 절대 검색량이 아니라 상대 관심도 지표를 반환합니다. 연관 키워드 표의 검색량 컬럼은
                    별도 네이버 보강값이 있으면 실측값을, 없으면 Google 쿼리 점수를 기반으로 한 추정값을 표시합니다.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#002D74]" />
                  <h3 className="text-sm font-semibold text-gray-900">콘텐츠 분포</h3>
                </div>
                <DistributionList
                  items={contentDistribution}
                  emptyLabel={platform === 'naver' ? '콘텐츠 분포 데이터가 없습니다.' : 'Google 모드에서는 채널 분포를 제공하지 않습니다.'}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={<Search className="h-4 w-4" />}
              title="연관 키워드"
              description="검색량, CTR 프록시, 콘텐츠 포화도, 최근 30일 트렌드, 시드 키워드와의 텍스트 연관성을 함께 반영합니다."
              actions={
                <div className="inline-flex rounded-2xl bg-gray-100 p-1 text-sm">
                  <button
                    type="button"
                    onClick={() => setRelatedView('table')}
                    className={[
                      'inline-flex items-center gap-2 rounded-2xl px-3 py-2 font-medium transition-colors',
                      relatedView === 'table' ? 'bg-white text-[#002D74] shadow-sm' : 'text-gray-500',
                    ].join(' ')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    표
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelatedView('cloud')}
                    className={[
                      'inline-flex items-center gap-2 rounded-2xl px-3 py-2 font-medium transition-colors',
                      relatedView === 'cloud' ? 'bg-white text-[#002D74] shadow-sm' : 'text-gray-500',
                    ].join(' ')}
                  >
                    <Sparkles className="h-4 w-4" />
                    워드클라우드
                  </button>
                </div>
              }
            />

            {relatedLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : relatedKeywords.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center text-sm text-gray-400">
                연관 키워드를 아직 확보하지 못했습니다.
              </div>
            ) : relatedView === 'cloud' ? (
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                {cloudWords.length > 0 ? (
                  <WordCloudView
                    words={cloudWords}
                    onWordClick={(text) => handleSearch(text)}
                  />
                ) : (
                  <div className="h-[320px] animate-pulse rounded-2xl bg-white" />
                )}
                <p className="mt-1 text-center text-[10px] text-gray-400">
                  크기 = 검색량 · 색상 = 트렌드(빨강=급상승, 주황=상승, 초록=안정) · 클릭 시 해당 키워드 분석
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                        <th className="px-4 py-3">키워드</th>
                        <th className="px-4 py-3 text-right">검색량</th>
                        <th className="px-4 py-3 text-right">블로그 발행량</th>
                        <th className="px-4 py-3 text-right">30일 트렌드</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {displayedRelatedKeywords.map((item) => {
                        const metrics = item.metrics
                        const isHot = (metrics?.trendRatio ?? 1) >= 1.3
                        const isWarm = (metrics?.trendRatio ?? 1) >= 1.1 && (metrics?.trendRatio ?? 1) < 1.3
                        return (
                          <tr key={item.keyword} className="hover:bg-gray-50">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSearch(item.keyword)}
                                  className="font-medium text-gray-900 transition-colors hover:text-[#002D74] hover:underline"
                                >
                                  {item.keyword}
                                </button>
                                {isHot ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                                    <Flame className="h-3 w-3" />
                                    급상승
                                  </span>
                                ) : null}
                                {!isHot && isWarm ? (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                    상승
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right text-gray-700">{formatNumber(item.displayVolume)}</td>
                            <td className="px-4 py-3.5 text-right text-gray-700">
                              {metrics ? formatNumber(metrics.blogCount) : '-'}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {metrics ? (
                                <span
                                  className={[
                                    'font-medium',
                                    metrics.trendRatio >= 1.3
                                      ? 'text-rose-600'
                                      : metrics.trendRatio >= 1.1
                                        ? 'text-amber-600'
                                        : metrics.trendRatio <= 0.8
                                          ? 'text-gray-400'
                                          : 'text-gray-600',
                                  ].join(' ')}
                                >
                                  {formatTrendRatio(metrics.trendRatio)}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {relatedKeywords.length > 7 ? (
                  <div className="mt-4 flex justify-center p-4">
                    <button
                      type="button"
                      onClick={() => setShowAllRelated((current) => !current)}
                      className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-[#002D74] hover:text-[#002D74]"
                    >
                      {showAllRelated ? '상위 7개만 보기' : `전체 ${relatedKeywords.length}개 보기`}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {platform === 'naver' ? (
            <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                icon={<FileText className="h-4 w-4" />}
                title="네이버 블로그 주제 블록"
                description="검색 결과 주변에서 실제로 묶여 노출되는 블로그 주제를 확인해, 어떤 서브 토픽이 함께 소비되는지 빠르게 파악합니다."
              />

              {smartBlockLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : smartBlocks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center text-sm text-gray-400">
                  블로그 주제 블록 데이터를 아직 확보하지 못했습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {smartBlocks.map((block) => (
                    <div key={block.topic} className="overflow-hidden rounded-3xl border border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#002D74]">#{block.topic}</p>
                          <p className="text-xs text-gray-500">연관 블로그 {formatNumber(block.total)}건</p>
                        </div>
                        <a
                          href={`https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(block.topic)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#03C75A]"
                        >
                          네이버에서 보기
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {block.posts.map((post, index) => (
                          <a
                            key={`${block.topic}-${index}`}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-gray-50"
                          >
                            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">{post.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{post.description}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                                <span>{post.bloggername}</span>
                                {post.postdate ? (
                                  <span>
                                    {post.postdate.slice(0, 4)}.{post.postdate.slice(4, 6)}.{post.postdate.slice(6, 8)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <DatalabForm />
        </div>
      ) : (
        <section className="rounded-[30px] border-2 border-dashed border-gray-200 bg-white/70 px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#002D74]/8 text-[#002D74]">
              <Grape className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-gray-900">검색어를 입력하면 블루베리가 분석을 시작합니다.</h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              검색량, 채널별 콘텐츠 분포, 연관 키워드, 최근 트렌드, 블로그 주제 블록을 하나의 흐름으로 확인할 수 있습니다.
            </p>
            <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
                <Wifi className="h-4 w-4 text-[#002D74]" />
                <p className="mt-3 text-sm font-semibold text-gray-900">실시간 API 연동</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Naver, Google, DataLab 데이터를 요청 시점 기준으로 갱신합니다.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
                <TrendingUp className="h-4 w-4 text-[#002D74]" />
                <p className="mt-3 text-sm font-semibold text-gray-900">트렌드 가중치</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">최근 30일 상승률이 큰 키워드를 상위에 우선 배치합니다.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
                <Trophy className="h-4 w-4 text-[#002D74]" />
                <p className="mt-3 text-sm font-semibold text-gray-900">연관도 우선순위</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">검색량, CTR 프록시, 포화도, 텍스트 유사도를 함께 점수화합니다.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
