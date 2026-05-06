'use client'

import { useState } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  RefreshCw,
  TrendingUp,
  Globe,
  BarChart2,
  AlertTriangle,
  ExternalLink,
  Newspaper,
} from 'lucide-react'
import MarketNav from './MarketNav'

// ─── Types ───────────────────────────────────────────────────────────────────

type ThreatLevel = 'VERY HIGH' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW-MEDIUM' | 'LOW'

interface TechRating {
  hifu: number
  rf: number
  laser: number
  body: number
  injectables?: number
}

interface Competitor {
  id: string
  name: string
  nameKo: string
  region: 'korea' | 'global'
  revenue: string
  revenueUSD: number
  growth: number
  products: string[]
  tech: TechRating
  threat: ThreatLevel
  recentNews: string
  vsClassys: string
  color: string
  listed?: string
  country?: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CLASSYS = {
  id: 'classys',
  name: 'CLASSYS',
  nameKo: '클래시스',
  revenue: '₩2,050억 / $154M',
  revenueUSD: 154,
  growth: 18.4,
  products: ['VOLNEWMER', 'Shurink Universe', 'ULTRAFORMER III/IV', 'ViOL Plus', 'CoolMini'],
  tech: { hifu: 5, rf: 3, laser: 2, body: 3 },
  listed: 'KOSDAQ 900140',
  globalPresence: '70개국 직배 네트워크',
  strengths: [
    'HIFU 글로벌 1위 점유율',
    'K-Beauty 프리미엄 브랜드 인지도',
    '70개국 직배 네트워크',
    'ULTRAFORMER · Shurink Universe 플래그십 포트폴리오',
    'R&D 기반 차세대 HIFU 기술 파이프라인',
  ],
  color: '#002D74',
}

const KOREAN_COMPETITORS: Competitor[] = [
  {
    id: 'wontech',
    name: 'Wontech',
    nameKo: '원텍',
    region: 'korea',
    revenue: '₩820억 / $62M',
    revenueUSD: 62,
    growth: 12.3,
    products: ['OLIGIO (HIFU)', 'ViOL (RF)', 'HELIOS III (Pico Laser)'],
    tech: { hifu: 4, rf: 3, laser: 2, body: 1 },
    threat: 'HIGH',
    recentNews: 'OLIGIO 신모델 2026 출시, 미국 FDA 510(k) 심사 중',
    vsClassys: 'HIFU 직접 경쟁 — OLIGIO vs Shurink/ULTRAFORMER, 미국 시장 동시 공략',
    color: '#0284c7',
    listed: 'KOSDAQ 226400',
  },
  {
    id: 'asterasys',
    name: 'Asterasys',
    nameKo: '아스테라시스',
    region: 'korea',
    revenue: '₩430억 / $32M',
    revenueUSD: 32,
    growth: 8.1,
    products: ['Ultracel Z+ (HIFU)', 'Ultracel Q+ (HIFU+RF)', 'SLIMLIPO (Lipolysis)'],
    tech: { hifu: 4, rf: 2, laser: 1, body: 2 },
    threat: 'HIGH',
    recentNews: 'Ultracel Z+ 유럽 CE 마크 갱신 완료',
    vsClassys: 'HIFU 직접 경쟁 — 유럽 채널에서 가격 경쟁 심화',
    color: '#7c3aed',
    listed: 'KOSDAQ',
  },
  {
    id: 'lutronic',
    name: 'Lutronic / Hologic',
    nameKo: '루트로닉',
    region: 'korea',
    revenue: '₩1,800억 / $136M',
    revenueUSD: 136,
    growth: 21.0,
    products: ['Clarity II (Laser)', 'SPECTRA (Pigment)', 'LaseMD Ultra', 'Lona (HIFU)'],
    tech: { hifu: 2, rf: 2, laser: 5, body: 1 },
    threat: 'MEDIUM-HIGH',
    recentNews: 'Hologic 통합 후 글로벌 영업망 확장, Lona HIFU 신시장 공략',
    vsClassys: '레이저 강점 + Lona HIFU 확장으로 CLASSYS 핵심 영역 진입 시도',
    color: '#dc2626',
    listed: 'Hologic (NASDAQ: HOLX)',
  },
  {
    id: 'jeysis',
    name: 'Jeysis Medical',
    nameKo: '제이시스메디칼',
    region: 'korea',
    revenue: '₩580억 / $44M',
    revenueUSD: 44,
    growth: 15.2,
    products: ['PICOCARE (Pico Laser)', 'PICOPLUS', 'AQUAGOLD', 'Juvelook'],
    tech: { hifu: 1, rf: 1, laser: 4, body: 1 },
    threat: 'MEDIUM',
    recentNews: 'PICOCARE 450 신모델 FDA 승인, 미국 시장 진출 본격화',
    vsClassys: '레이저·스킨부스터 중심으로 직접 경쟁 낮음, 미국 클리닉 채널 중복',
    color: '#059669',
    listed: 'KOSDAQ',
  },
  {
    id: 'tentec',
    name: 'Tentec',
    nameKo: '텐텍',
    region: 'korea',
    revenue: '₩185억 / $14M',
    revenueUSD: 14,
    growth: 4.2,
    products: ['RF 피부탄력 기기', '고주파 치료기'],
    tech: { hifu: 1, rf: 3, laser: 0, body: 1 },
    threat: 'LOW-MEDIUM',
    recentNews: '중국 NMPA 갱신 완료, 동남아 유통망 확장',
    vsClassys: 'RF 영역 일부 경쟁, 규모·기술력 격차로 위협 제한적',
    color: '#78716c',
  },
  {
    id: 'merz',
    name: 'Merz Aesthetics Korea',
    nameKo: '멀츠 에스테틱스 코리아',
    region: 'korea',
    revenue: '₩480억(추정) / $36M',
    revenueUSD: 36,
    growth: 7.8,
    products: ['Ultherapy (HIFU)', 'Belotero', 'Radiesse', 'Bocouture'],
    tech: { hifu: 3, rf: 1, laser: 0, body: 0, injectables: 5 },
    threat: 'HIGH',
    recentNews: 'Ultherapy 2.0 한국 출시, 클리닉 채널 공세 강화',
    vsClassys: 'Ultherapy 브랜드파워로 HIFU 프리미엄 포지셔닝 직접 경쟁',
    color: '#0891b2',
    listed: 'Merz Pharma (Private)',
  },
  {
    id: 'solta',
    name: 'Solta Medical Korea',
    nameKo: '솔타메디칼 코리아',
    region: 'korea',
    revenue: '₩310억(추정) / $23M',
    revenueUSD: 23,
    growth: 5.1,
    products: ['Thermage FLX (RF)', 'Fraxel Dual (Laser)', 'Clear+Brilliant'],
    tech: { hifu: 0, rf: 4, laser: 3, body: 1 },
    threat: 'MEDIUM-HIGH',
    recentNews: 'Thermage FLX Prime 글로벌 런칭, 아시아 마케팅 강화',
    vsClassys: 'Thermage RF 강력 브랜드 — RF 업셀링 시장에서 간접 경쟁',
    color: '#9333ea',
    listed: 'Bausch Health (NYSE: BHC)',
  },
]

const GLOBAL_COMPETITORS: Competitor[] = [
  {
    id: 'inmode',
    name: 'InMode',
    nameKo: '인모드',
    region: 'global',
    revenue: '$530M',
    revenueUSD: 530,
    growth: 14.2,
    products: ['EMFACE', 'Morpheus8', 'BodyTite', 'FaceRite', 'Evoke', 'Envision'],
    tech: { hifu: 2, rf: 5, laser: 1, body: 5 },
    threat: 'VERY HIGH',
    recentNews: 'EMFACE PRO FDA 510(k) 심사, 2026 매출 $600M 가이던스',
    vsClassys: '글로벌 직접 경쟁 — RF+Body 지배, HIFU 확장 본격화 시 핵심 위협',
    color: '#ea580c',
    listed: 'NASDAQ: INMD',
    country: 'Israel',
  },
  {
    id: 'cutera',
    name: 'Cutera',
    nameKo: '큐테라',
    region: 'global',
    revenue: '$238M',
    revenueUSD: 238,
    growth: -5.2,
    products: ['Enlighten (Pico)', 'truSculpt iD', 'XEO', 'Excel V+', 'Ultra HIFU'],
    tech: { hifu: 2, rf: 3, laser: 3, body: 2 },
    threat: 'MEDIUM',
    recentNews: '신규 Ultra HIFU CE 마크 획득, 유럽 반등 전략 추진',
    vsClassys: '구조조정으로 공격적 마케팅 약화, Ultra HIFU 재진입 모니터링 필요',
    color: '#0284c7',
    listed: 'NASDAQ: CUTR',
    country: 'USA',
  },
  {
    id: 'candela',
    name: 'Candela',
    nameKo: '캔델라',
    region: 'global',
    revenue: '~$420M',
    revenueUSD: 420,
    growth: 9.1,
    products: ['PicoWay', 'GentleMax Pro', 'Profound RF', 'Vbeam Perfecta'],
    tech: { hifu: 0, rf: 3, laser: 5, body: 1 },
    threat: 'MEDIUM',
    recentNews: 'GentleMax Pro Plus 신모델 글로벌 출시',
    vsClassys: '레이저 강점, HIFU 미보유로 핵심 영역 직접 경쟁 없음',
    color: '#9333ea',
    listed: 'Private',
    country: 'USA',
  },
  {
    id: 'cynosure',
    name: 'Cynosure / Hologic',
    nameKo: '사이노슈어',
    region: 'global',
    revenue: '~$500M',
    revenueUSD: 500,
    growth: 18.8,
    products: ['PicoSure Pro', 'SculpSure', 'TempSure Envi', '루트로닉 자산 통합'],
    tech: { hifu: 2, rf: 3, laser: 5, body: 3 },
    threat: 'HIGH',
    recentNews: 'Hologic 루트로닉 통합 완료, HIFU+Laser 패키지 판매 전략',
    vsClassys: '루트로닉 HIFU 자산 흡수로 CLASSYS 핵심 영역 위협 증가',
    color: '#b91c1c',
    listed: 'NASDAQ: HOLX',
    country: 'USA',
  },
  {
    id: 'venus',
    name: 'Venus Concept',
    nameKo: '비너스 컨셉',
    region: 'global',
    revenue: '$158M',
    revenueUSD: 158,
    growth: 6.3,
    products: ['Venus Bliss MAX', 'Venus Legacy', 'Venus Viva', 'Venus Versa Pro'],
    tech: { hifu: 2, rf: 4, laser: 1, body: 3 },
    threat: 'MEDIUM',
    recentNews: '구독 기반 비즈니스 모델 확대, Venus Bliss MAX 아시아 출시',
    vsClassys: 'RF+Body 중심, 아시아 확장 시 일부 채널 경쟁 발생 가능',
    color: '#0d9488',
    listed: 'NASDAQ: VERO',
    country: 'Canada',
  },
  {
    id: 'alma',
    name: 'Alma Lasers',
    nameKo: '알마 레이저',
    region: 'global',
    revenue: '~$220M',
    revenueUSD: 220,
    growth: 11.4,
    products: ['Soprano Ice Platinum', 'Harmony XL Pro', 'Alma Hybrid', 'Opus (RF)'],
    tech: { hifu: 1, rf: 3, laser: 4, body: 2 },
    threat: 'MEDIUM',
    recentNews: '중국 자본 배경으로 아시아 시장 공격적 확장',
    vsClassys: '중국 자본 기반 아시아 공세, 가격 경쟁 및 채널 잠식 가능성',
    color: '#ca8a04',
    listed: 'Private (Chinese ownership)',
    country: 'Israel',
  },
]

const ALL_COMPETITORS = [...KOREAN_COMPETITORS, ...GLOBAL_COMPETITORS]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function threatColor(threat: ThreatLevel) {
  if (threat === 'VERY HIGH') return 'bg-red-200 text-red-800'
  if (threat === 'HIGH') return 'bg-red-100 text-red-700'
  if (threat === 'MEDIUM-HIGH') return 'bg-orange-100 text-orange-700'
  if (threat === 'MEDIUM') return 'bg-amber-100 text-amber-700'
  if (threat === 'LOW-MEDIUM') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

function techCountForZ(tech: TechRating): number {
  return Object.values(tech).filter((v) => v > 0).length
}

function StarDots({ count, max = 5, color }: { count: number; max?: number; color?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: i < count ? (color ?? '#002D74') : '#e5e7eb' }}
        />
      ))}
    </span>
  )
}

type ScatterTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: { name: string; revenueUSD: number; growth: number } }>
}

function ScatterTooltip({ active, payload }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900">{d.name}</p>
      <p className="text-gray-500">
        매출: <span className="text-gray-800 font-medium">${d.revenueUSD}M</span>
      </p>
      <p className="text-gray-500">
        성장률: <span className="text-gray-800 font-medium">{d.growth > 0 ? '+' : ''}{d.growth}%</span>
      </p>
    </div>
  )
}

// ─── Positioning Map Data ─────────────────────────────────────────────────────

const koreaScatterData = [
  ...KOREAN_COMPETITORS.map((c) => ({
    name: c.name,
    revenueUSD: c.revenueUSD,
    growth: c.growth,
    z: techCountForZ(c.tech),
  })),
]

const globalScatterData = [
  ...GLOBAL_COMPETITORS.map((c) => ({
    name: c.name,
    revenueUSD: c.revenueUSD,
    growth: c.growth,
    z: techCountForZ(c.tech),
  })),
]

const classysScatterData = [
  {
    name: 'CLASSYS',
    revenueUSD: CLASSYS.revenueUSD,
    growth: CLASSYS.growth,
    z: techCountForZ(CLASSYS.tech),
  },
]

// ─── Tech Matrix ──────────────────────────────────────────────────────────────

const MATRIX_COMPANIES = [
  { name: 'CLASSYS', tech: CLASSYS.tech, highlight: true },
  { name: 'InMode', tech: GLOBAL_COMPETITORS.find((c) => c.id === 'inmode')!.tech },
  { name: 'Merz (Ultherapy)', tech: KOREAN_COMPETITORS.find((c) => c.id === 'merz')!.tech },
  { name: 'Wontech', tech: KOREAN_COMPETITORS.find((c) => c.id === 'wontech')!.tech },
  { name: 'Solta Medical', tech: KOREAN_COMPETITORS.find((c) => c.id === 'solta')!.tech },
  { name: 'Lutronic', tech: KOREAN_COMPETITORS.find((c) => c.id === 'lutronic')!.tech },
]

const TECH_ROWS: { key: keyof TechRating; label: string }[] = [
  { key: 'hifu', label: 'HIFU' },
  { key: 'rf', label: 'RF' },
  { key: 'laser', label: 'Pico / Fractional Laser' },
  { key: 'body', label: 'Body Contouring' },
  { key: 'injectables', label: 'Injectables' },
]

// ─── Filter Types ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'hifu' | 'rf' | 'laser'

const FILTER_LABELS: Record<FilterKey, string> = {
  all: '전체',
  hifu: 'HIFU 직접경쟁',
  rf: 'RF',
  laser: 'Laser',
}

function filterCompetitors(list: Competitor[], key: FilterKey): Competitor[] {
  if (key === 'all') return list
  if (key === 'hifu') return list.filter((c) => c.tech.hifu >= 3)
  if (key === 'rf') return list.filter((c) => c.tech.rf >= 3)
  if (key === 'laser') return list.filter((c) => c.tech.laser >= 3)
  return list
}

// ─── Competitor Card ──────────────────────────────────────────────────────────

function CompetitorCard({ c }: { c: Competitor }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: c.color }}
            />
            <h3 className="text-sm font-bold text-gray-900">{c.nameKo}</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{c.name}</p>
          {c.listed && (
            <p className="text-xs text-gray-400">{c.listed}</p>
          )}
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${threatColor(c.threat)}`}
        >
          {c.threat}
        </span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] text-gray-400 mb-0.5">Revenue</p>
          <p className="text-xs font-semibold text-gray-800">{c.revenue}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] text-gray-400 mb-0.5">YoY Growth</p>
          <p
            className={`text-xs font-bold ${c.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {c.growth > 0 ? '+' : ''}
            {c.growth}%
          </p>
        </div>
      </div>

      {/* Products */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          핵심 제품
        </p>
        <div className="flex flex-wrap gap-1">
          {c.products.map((p) => (
            <span
              key={p}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${c.color}18`, color: c.color }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Tech Ratings */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          기술 강도
        </p>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
          {[
            { label: 'HIFU', val: c.tech.hifu },
            { label: 'RF', val: c.tech.rf },
            { label: 'Laser', val: c.tech.laser },
            { label: 'Body', val: c.tech.body },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-500 w-10 shrink-0">{label}</span>
              <StarDots count={val} color={c.color} />
            </div>
          ))}
        </div>
      </div>

      {/* vs CLASSYS */}
      <div className="rounded-xl border border-[#002D74]/10 bg-[#002D74]/5 px-3 py-2">
        <p className="text-[10px] font-semibold text-[#002D74] mb-0.5">vs CLASSYS</p>
        <p className="text-[11px] text-gray-700 leading-relaxed">{c.vsClassys}</p>
      </div>

      {/* Recent News */}
      <div className="flex items-start gap-1.5">
        <Newspaper className="h-3 w-3 mt-0.5 text-gray-400 shrink-0" />
        <p className="text-[11px] text-gray-500 leading-relaxed">{c.recentNews}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompetitorsClient() {
  const [koFilter, setKoFilter] = useState<FilterKey>('all')
  const [glFilter, setGlFilter] = useState<FilterKey>('all')

  const filteredKorean = filterCompetitors(KOREAN_COMPETITORS, koFilter)
  const filteredGlobal = filterCompetitors(GLOBAL_COMPETITORS, glFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketNav />

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competitor Intelligence</h1>
            <p className="text-sm text-gray-500 mt-1">CLASSYS 기준 국내외 경쟁사 분석</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">기준일: 2026-05-06</span>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
              새로고침
            </button>
          </div>
        </div>

        {/* ── CLASSYS Baseline Card ── */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #002D74 0%, #0084C9 100%)' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 px-3 py-1 text-xs font-bold tracking-widest uppercase">
                  기준 회사
                </div>
                <h2 className="text-xl font-bold">CLASSYS (클래시스)</h2>
                <a
                  href="https://finance.naver.com/item/main.naver?code=900140"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold hover:bg-white/30 transition-colors"
                >
                  {CLASSYS.listed}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: BarChart2, label: 'Revenue', value: CLASSYS.revenue },
                  { icon: TrendingUp, label: 'YoY Growth', value: `+${CLASSYS.growth}%` },
                  { icon: Globe, label: '글로벌 진출', value: CLASSYS.globalPresence },
                  { icon: AlertTriangle, label: '핵심 기술', value: 'HIFU 글로벌 1위' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-white/10 px-4 py-3">
                    <Icon className="h-4 w-4 mb-1 opacity-70" />
                    <p className="text-[11px] opacity-70">{label}</p>
                    <p className="text-sm font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs opacity-70 mb-2 font-semibold uppercase tracking-wide">
                  핵심 제품
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CLASSYS.products.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-64 shrink-0">
              <p className="text-xs opacity-70 mb-2 font-semibold uppercase tracking-wide">
                핵심 경쟁 강점
              </p>
              <ul className="space-y-1.5">
                {CLASSYS.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Positioning Map ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">경쟁 포지셔닝 맵</h2>
          <p className="text-xs text-gray-400 mb-6">
            X축: 매출 규모 (USD M) · Y축: YoY 성장률 (%) · 버블 크기: 기술 카테고리 수
          </p>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                type="number"
                dataKey="revenueUSD"
                name="Revenue"
                unit="M$"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Revenue (USD M)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                type="number"
                dataKey="growth"
                name="Growth"
                unit="%"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'YoY Growth (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#9ca3af' }}
              />
              <ZAxis type="number" dataKey="z" range={[30, 300]} />
              <Tooltip content={<ScatterTooltip />} />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 2" />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              />
              <Scatter
                name="국내 경쟁사"
                data={koreaScatterData}
                fill="#0084C9"
                fillOpacity={0.7}
              />
              <Scatter
                name="글로벌 경쟁사"
                data={globalScatterData}
                fill="#f97316"
                fillOpacity={0.7}
              />
              <Scatter
                name="CLASSYS"
                data={classysScatterData}
                fill="#002D74"
                fillOpacity={1}
                shape={(props: Record<string, number>) => {
                  const { cx, cy, r } = props as { cx: number; cy: number; r: number }
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={r + 4} fill="#002D74" fillOpacity={0.15} />
                      <circle cx={cx} cy={cy} r={r} fill="#002D74" />
                      <text x={cx + r + 6} y={cy + 4} fontSize={11} fontWeight={700} fill="#002D74">
                        CLASSYS
                      </text>
                    </g>
                  )
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* ── Korean Competitors ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">국내 경쟁사</h2>
              <p className="text-xs text-gray-400">{KOREAN_COMPETITORS.length}개 주요 경쟁사</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKoFilter(k)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    koFilter === k
                      ? 'bg-[#002D74] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {FILTER_LABELS[k]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKorean.map((c) => (
              <CompetitorCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* ── Global Competitors ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">글로벌 경쟁사</h2>
              <p className="text-xs text-gray-400">{GLOBAL_COMPETITORS.length}개 주요 경쟁사</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setGlFilter(k)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    glFilter === k
                      ? 'bg-[#002D74] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {FILTER_LABELS[k]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGlobal.map((c) => (
              <CompetitorCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* ── Tech Matrix ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">기술 카테고리 매트릭스</h2>
          <p className="text-xs text-gray-400 mb-6">
            주요 기술 영역별 경쟁사 강도 비교 (filled dot 5단계)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[160px]">
                    기술 영역
                  </th>
                  {MATRIX_COMPANIES.map(({ name, highlight }) => (
                    <th
                      key={name}
                      className={`text-center py-2 px-3 text-xs font-semibold uppercase tracking-wide min-w-[110px] rounded-t-lg ${
                        highlight ? 'text-[#002D74] bg-[#002D74]/5' : 'text-gray-500'
                      }`}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TECH_ROWS.map(({ key, label }, rowIdx) => (
                  <tr
                    key={key}
                    className={rowIdx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}
                  >
                    <td className="py-3 pr-4 text-xs font-medium text-gray-700">{label}</td>
                    {MATRIX_COMPANIES.map(({ name, tech, highlight }) => {
                      const val = tech[key] ?? 0
                      return (
                        <td
                          key={name}
                          className={`text-center py-3 px-3 ${
                            highlight ? 'bg-[#002D74]/5' : ''
                          }`}
                        >
                          <div className="flex justify-center">
                            <StarDots
                              count={val}
                              color={highlight ? '#002D74' : '#6b7280'}
                            />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Competitive Intelligence Feed ── */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-1">경쟁 인텔리전스</h2>
          <p className="text-xs text-gray-400 mb-4">최근 경쟁사 주요 동향</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_COMPETITORS.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white shadow-sm p-4"
              >
                <span
                  className="mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.color}18` }}
                >
                  <Newspaper className="h-4 w-4" style={{ color: c.color }} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-800">{c.nameKo}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${threatColor(c.threat)}`}
                    >
                      {c.threat}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {c.region === 'korea' ? '국내' : '글로벌'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{c.recentNews}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
