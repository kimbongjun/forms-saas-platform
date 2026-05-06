'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import {
  AlertTriangle,
  BarChart3,
  ExternalLink,
  Globe,
  Newspaper,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import MarketNav from './MarketNav'

type ThreatLevel = 'VERY HIGH' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW-MEDIUM'
type FilterKey = 'all' | 'hifu' | 'rf' | 'laser'

type TechRating = {
  hifu: number
  rf: number
  laser: number
  body: number
  injectables?: number
}

type Competitor = {
  id: string
  name: string
  nameKo: string
  region: 'korea' | 'global'
  basedIn: string
  scaleLabel: string
  scaleUSD: number
  momentum: number
  overlap: string
  products: string[]
  focus: string[]
  recentMove: string
  threat: ThreatLevel
  tech: TechRating
  officialUrl: string
  sourceLabel: string
  color: string
}

const REPORT_DATE = '2026-05-06'

const CLASSYS = {
  name: 'CLASSYS',
  nameKo: '클래시스',
  listed: 'KOSDAQ 214150',
  scaleLabel: '2025 매출 3,368억 원 / 약 $246M',
  scaleUSD: 246,
  momentum: 38.7,
  products: ['Ultraformer', 'Shurink Universe', 'Volnewmer', 'Secret DUO', 'Skinsys'],
  strengths: [
    'HIFU와 RF를 모두 보유한 에너지 기반 리프팅 포트폴리오',
    '아시아에서 강한 유통망과 교육형 세일즈 구조',
    '시술 장비와 소모품, 임상 콘텐츠를 함께 묶는 확장성',
    '브랜드 포지셔닝이 프리미엄이면서도 글로벌 확장 여지 보유',
  ],
  sourceUrl: 'https://classys.co.kr/?kboard_content_redirect=605',
}

const KOREAN_COMPETITORS: Competitor[] = [
  {
    id: 'merz',
    name: 'Merz Aesthetics Korea',
    nameKo: '멀츠 에스테틱스 코리아',
    region: 'korea',
    basedIn: 'Germany / Korea',
    scaleLabel: '글로벌 매출 10억 유로 이상',
    scaleUSD: 1100,
    momentum: 9,
    overlap: 'Ultherapy 중심 프리미엄 HIFU 포지션이 CLASSYS와 직접 충돌합니다.',
    products: ['Ultherapy PRIME', 'Belotero', 'Radiesse', 'Xeomin'],
    focus: ['프리미엄 리프팅', '의사 교육', '브랜드 캠페인'],
    recentMove: 'Ultherapy 브랜드 고도화와 교육형 마케팅을 강화하고 있습니다.',
    threat: 'HIGH',
    tech: { hifu: 5, rf: 1, laser: 0, body: 0, injectables: 5 },
    officialUrl: 'https://www.merz-aesthetics.com/',
    sourceLabel: 'Merz Aesthetics',
    color: '#0f766e',
  },
  {
    id: 'solta',
    name: 'Solta Medical Korea',
    nameKo: '솔타메디칼 코리아',
    region: 'korea',
    basedIn: 'USA / Korea',
    scaleLabel: 'RF·Laser 글로벌 프리미엄 브랜드',
    scaleUSD: 420,
    momentum: 6,
    overlap: 'Thermage FLX의 RF 리프팅 포지션이 Volnewmer와 환자 수요를 나눕니다.',
    products: ['Thermage FLX', 'Fraxel', 'Clear + Brilliant'],
    focus: ['RF 리프팅', '피부재생', '프리미엄 시술'],
    recentMove: 'Thermage 중심의 프리미엄 리프팅 브랜딩을 지속 확대 중입니다.',
    threat: 'MEDIUM-HIGH',
    tech: { hifu: 0, rf: 5, laser: 4, body: 1 },
    officialUrl: 'https://www.soltamedical.com/',
    sourceLabel: 'Solta Medical',
    color: '#7c3aed',
  },
  {
    id: 'lutronic',
    name: 'Lutronic',
    nameKo: '루트로닉',
    region: 'korea',
    basedIn: 'Korea / USA',
    scaleLabel: 'Laser 강자, Hologic 계열 시너지',
    scaleUSD: 180,
    momentum: 12,
    overlap: '레이저 강점에 더해 에너지 기반 포트폴리오를 확장하며 CLASSYS 영역에 접근합니다.',
    products: ['DermaV', 'LaseMD Ultra', 'Clarity II', 'Genius RF'],
    focus: ['레이저', 'RF', '글로벌 KOL 네트워크'],
    recentMove: '미국 채널 강화와 함께 에너지 기반 미용 포트폴리오를 재정비하고 있습니다.',
    threat: 'MEDIUM-HIGH',
    tech: { hifu: 1, rf: 4, laser: 5, body: 1 },
    officialUrl: 'https://www.lutronic.com/us/',
    sourceLabel: 'Lutronic',
    color: '#dc2626',
  },
  {
    id: 'jeisys',
    name: 'Jeisys Medical',
    nameKo: '제이시스메디칼',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'HIFU·RF·Laser 복합 포트폴리오',
    scaleUSD: 150,
    momentum: 8,
    overlap: 'LinearZ, Density, Potenza 계열이 CLASSYS의 HIFU·RF와 겹칩니다.',
    products: ['Density', 'LinearZ', 'POTENZA', 'PicoQ'],
    focus: ['에너지 기반 리프팅', '복합 장비 세트업', '해외 총판'],
    recentMove: 'HIFU와 RF를 묶는 패키지 영업으로 병원당 객단가를 높이는 전략을 씁니다.',
    threat: 'HIGH',
    tech: { hifu: 4, rf: 4, laser: 3, body: 1 },
    officialUrl: 'https://www.jeisys.com/',
    sourceLabel: 'Jeisys Medical',
    color: '#0284c7',
  },
  {
    id: 'wontech',
    name: 'Wontech',
    nameKo: '원텍',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'OLIGIO 중심 RF 확장',
    scaleUSD: 120,
    momentum: 14,
    overlap: 'OLIGIO가 Volnewmer와 가장 직접적인 RF 경쟁 축을 형성합니다.',
    products: ['OLIGIO', 'HELIOS', 'PICOCARE', 'Tightan'],
    focus: ['RF 리프팅', '피코 레이저', '해외 유통 확장'],
    recentMove: 'OLIGIO 브랜드 인지도를 앞세운 공격적 마케팅이 이어지고 있습니다.',
    threat: 'HIGH',
    tech: { hifu: 2, rf: 5, laser: 4, body: 1 },
    officialUrl: 'https://wontech.co.kr/',
    sourceLabel: 'Wontech',
    color: '#2563eb',
  },
  {
    id: 'tentec',
    name: 'Tentech',
    nameKo: '텐텍',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'RF 기반 틈새 플레이어',
    scaleUSD: 30,
    momentum: 5,
    overlap: '규모는 작지만 RF 시술 장비 영역에서 가격 민감 채널을 공략합니다.',
    products: ['10THERMA', 'LEGATO II', 'TECAR'],
    focus: ['RF', '중저가 채널', '해외 총판형 영업'],
    recentMove: '지역 총판 중심으로 동남아·중남미 채널을 넓히는 흐름입니다.',
    threat: 'LOW-MEDIUM',
    tech: { hifu: 1, rf: 4, laser: 1, body: 1 },
    officialUrl: 'https://www.tentech.co.kr/',
    sourceLabel: 'Tentech',
    color: '#78716c',
  },
  {
    id: 'asterasys',
    name: 'Asterasys',
    nameKo: '아스테라시스',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'Ultracel 계열 HIFU 전문성',
    scaleUSD: 45,
    momentum: 7,
    overlap: 'Ultracel 브랜드가 HIFU 시장에서 CLASSYS와 직접 비교됩니다.',
    products: ['Ultracel Q+', 'Ultracel Z+', 'Liftera'],
    focus: ['HIFU', '유럽·중동 채널', '임상 기반 세일즈'],
    recentMove: 'HIFU 적응증 확대와 해외 총판 교육을 강화하고 있습니다.',
    threat: 'MEDIUM-HIGH',
    tech: { hifu: 5, rf: 2, laser: 1, body: 1 },
    officialUrl: 'https://www.asterasys.com/',
    sourceLabel: 'Asterasys',
    color: '#9333ea',
  },
]

const GLOBAL_COMPETITORS: Competitor[] = [
  {
    id: 'inmode',
    name: 'InMode',
    nameKo: '인모드',
    region: 'global',
    basedIn: 'Israel / USA',
    scaleLabel: '상장사, 글로벌 RF 선도',
    scaleUSD: 530,
    momentum: 14,
    overlap: 'RF와 안면 리프팅, 바디까지 묶는 패키지로 CLASSYS의 확장 전략과 부딪힙니다.',
    products: ['Morpheus8', 'Forma', 'Evoke', 'EMFACE'],
    focus: ['RF 리프팅', '바디', '멀티 플랫폼 세일즈'],
    recentMove: 'EMFACE와 Morpheus8 조합으로 프리미엄 복합 시술 수요를 키우고 있습니다.',
    threat: 'VERY HIGH',
    tech: { hifu: 1, rf: 5, laser: 1, body: 5 },
    officialUrl: 'https://inmodemd.com/',
    sourceLabel: 'InMode',
    color: '#ea580c',
  },
  {
    id: 'candela',
    name: 'Candela',
    nameKo: '캔델라',
    region: 'global',
    basedIn: 'USA',
    scaleLabel: '레이저 대형 사업자',
    scaleUSD: 420,
    momentum: 8,
    overlap: '레이저 중심이지만 프리미엄 병원 채널 장악력이 높아 경쟁 고객층이 겹칩니다.',
    products: ['GentleMax Pro Plus', 'PicoWay', 'Profound RF'],
    focus: ['레이저', 'RF', '대형 병원 네트워크'],
    recentMove: 'PicoWay와 Profound RF를 묶어 프리미엄 클리닉 업셀링을 강화합니다.',
    threat: 'MEDIUM',
    tech: { hifu: 0, rf: 3, laser: 5, body: 1 },
    officialUrl: 'https://candelamedical.com/',
    sourceLabel: 'Candela',
    color: '#b91c1c',
  },
  {
    id: 'cynosure',
    name: 'Cynosure Lutronic',
    nameKo: '사이노슈어 루트로닉',
    region: 'global',
    basedIn: 'USA / Korea',
    scaleLabel: '통합 포트폴리오 확장 국면',
    scaleUSD: 500,
    momentum: 11,
    overlap: '레이저와 RF를 통합 포트폴리오로 재정비하면서 HIFU 대체 포지션을 강화합니다.',
    products: ['PicoSure Pro', 'TempSure', 'SculpSure', 'DermaV'],
    focus: ['레이저', 'RF', '북미 직접 판매'],
    recentMove: 'Cynosure와 Lutronic 자산 통합으로 글로벌 채널 효율화를 추진합니다.',
    threat: 'HIGH',
    tech: { hifu: 1, rf: 4, laser: 5, body: 3 },
    officialUrl: 'https://cynosurelutronic.com/',
    sourceLabel: 'Cynosure Lutronic',
    color: '#7f1d1d',
  },
  {
    id: 'alma',
    name: 'Alma',
    nameKo: '알마',
    region: 'global',
    basedIn: 'Israel',
    scaleLabel: '멀티 모달리티 장비 기업',
    scaleUSD: 220,
    momentum: 10,
    overlap: '레이저와 RF, 환자 교육형 마케팅 역량이 강해 중상위 글로벌 병원 채널에서 겹칩니다.',
    products: ['Harmony XL Pro', 'Soprano Titanium', 'Accent Prime', 'Opus'],
    focus: ['레이저', 'RF', '교육형 마케팅'],
    recentMove: '하이브리드 시술 패키지를 전면에 내세우며 클리닉당 장비 수를 늘립니다.',
    threat: 'MEDIUM',
    tech: { hifu: 0, rf: 4, laser: 5, body: 3 },
    officialUrl: 'https://almaasers.com/',
    sourceLabel: 'Alma',
    color: '#ca8a04',
  },
  {
    id: 'cutera',
    name: 'Cutera',
    nameKo: '큐테라',
    region: 'global',
    basedIn: 'USA',
    scaleLabel: '구조조정 중인 장비사',
    scaleUSD: 240,
    momentum: -5,
    overlap: 'HIFU와 바디, 레이저를 폭넓게 다루며 할인형 제안에서 경쟁합니다.',
    products: ['truSculpt', 'Excel V+', 'enlighten', 'Secret RF'],
    focus: ['바디', 'RF', '피부 레이저'],
    recentMove: '조직 재편 이후 수익성 중심 포트폴리오 운영으로 전환 중입니다.',
    threat: 'MEDIUM',
    tech: { hifu: 1, rf: 4, laser: 4, body: 4 },
    officialUrl: 'https://cutera.com/',
    sourceLabel: 'Cutera',
    color: '#0891b2',
  },
  {
    id: 'venus',
    name: 'Venus Concept',
    nameKo: '비너스 콘셉트',
    region: 'global',
    basedIn: 'Canada',
    scaleLabel: 'RF·바디 장비 특화',
    scaleUSD: 158,
    momentum: 6,
    overlap: 'RF와 바디 패키지 중심으로 멀티 디바이스 제안에서 충돌합니다.',
    products: ['Venus Legacy', 'Venus Viva', 'Venus Bliss MAX'],
    focus: ['RF', '바디', '구독형 서비스 모델'],
    recentMove: '소모품과 서비스형 매출 비중을 높이는 구조를 밀고 있습니다.',
    threat: 'MEDIUM',
    tech: { hifu: 0, rf: 4, laser: 1, body: 5 },
    officialUrl: 'https://venusconcept.com/',
    sourceLabel: 'Venus Concept',
    color: '#0d9488',
  },
]

const FILTER_LABELS: Record<FilterKey, string> = {
  all: '전체',
  hifu: 'HIFU',
  rf: 'RF',
  laser: 'Laser',
}

function threatColor(level: ThreatLevel) {
  if (level === 'VERY HIGH') return 'bg-red-200 text-red-800'
  if (level === 'HIGH') return 'bg-red-100 text-red-700'
  if (level === 'MEDIUM-HIGH') return 'bg-orange-100 text-orange-700'
  if (level === 'MEDIUM') return 'bg-amber-100 text-amber-700'
  return 'bg-yellow-100 text-yellow-700'
}

function techCountForZ(tech: TechRating) {
  return Object.values(tech).filter((value) => typeof value === 'number' && value > 0).length
}

function filterCompetitors(list: Competitor[], key: FilterKey) {
  if (key === 'all') return list
  if (key === 'hifu') return list.filter((item) => item.tech.hifu >= 3)
  if (key === 'rf') return list.filter((item) => item.tech.rf >= 3)
  return list.filter((item) => item.tech.laser >= 3)
}

function RatingDots({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: index < value ? color : '#e5e7eb' }}
        />
      ))}
    </div>
  )
}

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { name: string; scaleUSD: number; momentum: number; scaleLabel: string } }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-lg">
      <p className="font-semibold text-gray-900">{item.name}</p>
      <p className="text-gray-500">Scale proxy: {item.scaleLabel}</p>
      <p className="text-gray-500">
        Momentum: <span className="font-medium text-gray-800">{item.momentum > 0 ? '+' : ''}{item.momentum}%</span>
      </p>
    </div>
  )
}

function CompetitorCard({ item }: { item: Competitor }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <h3 className="text-sm font-bold text-gray-900">{item.nameKo}</h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{item.name}</p>
          <p className="text-xs text-gray-400">{item.basedIn}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${threatColor(item.threat)}`}>
          {item.threat}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Scale</p>
          <p className="mt-0.5 text-xs font-semibold text-gray-800">{item.scaleLabel}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Momentum</p>
          <p className={`mt-0.5 text-xs font-bold ${item.momentum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {item.momentum > 0 ? '+' : ''}
            {item.momentum}%
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Flagship</p>
        <div className="flex flex-wrap gap-1.5">
          {item.products.map((product) => (
            <span
              key={product}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{ backgroundColor: `${item.color}18`, color: item.color }}
            >
              {product}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Technology overlap</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-gray-600">
          <div className="flex items-center justify-between gap-2">
            <span>HIFU</span>
            <RatingDots value={item.tech.hifu} color={item.color} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>RF</span>
            <RatingDots value={item.tech.rf} color={item.color} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>Laser</span>
            <RatingDots value={item.tech.laser} color={item.color} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>Body</span>
            <RatingDots value={item.tech.body} color={item.color} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#002D74]/10 bg-[#002D74]/5 px-3 py-2">
        <p className="mb-0.5 text-[10px] font-semibold text-[#002D74]">vs CLASSYS</p>
        <p className="text-xs leading-relaxed text-gray-700">{item.overlap}</p>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Focus</p>
        <div className="flex flex-wrap gap-1.5">
          {item.focus.map((topic) => (
            <span key={topic} className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Newspaper className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        <p className="text-xs leading-relaxed text-gray-500">{item.recentMove}</p>
      </div>

      <a
        href={item.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        {item.sourceLabel}
        <ExternalLink className="h-3 w-3" />
      </a>
    </article>
  )
}

export default function CompetitorsClient() {
  const [koFilter, setKoFilter] = useState<FilterKey>('all')
  const [globalFilter, setGlobalFilter] = useState<FilterKey>('all')

  const filteredKorean = filterCompetitors(KOREAN_COMPETITORS, koFilter)
  const filteredGlobal = filterCompetitors(GLOBAL_COMPETITORS, globalFilter)
  const positioningData = [
    ...KOREAN_COMPETITORS,
    ...GLOBAL_COMPETITORS,
    {
      id: 'classys',
      name: CLASSYS.name,
      nameKo: CLASSYS.nameKo,
      region: 'global' as const,
      basedIn: 'Korea',
      scaleLabel: CLASSYS.scaleLabel,
      scaleUSD: CLASSYS.scaleUSD,
      momentum: CLASSYS.momentum,
      overlap: '',
      products: CLASSYS.products,
      focus: [],
      recentMove: '',
      threat: 'HIGH' as const,
      tech: { hifu: 5, rf: 4, laser: 1, body: 1 },
      officialUrl: CLASSYS.sourceUrl,
      sourceLabel: 'CLASSYS IR',
      color: '#002D74',
    },
  ].map((item) => ({
    name: item.name,
    scaleUSD: item.scaleUSD,
    momentum: item.momentum,
    z: techCountForZ(item.tech),
    scaleLabel: item.scaleLabel,
  }))

  return (
    <div className="min-h-full bg-gray-50">
      <MarketNav />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Competitors</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">CLASSYS 경쟁사 벤치마크</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              필수 국내 경쟁사인 멀츠, 솔타메디칼, 루트로닉, 제이시스메디칼, 원텍, 텐텍, 아스테라시스를 우선
              정리하고, 이를 기준으로 RF·HIFU·Laser 글로벌 피어군을 확장했습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>기준일 {REPORT_DATE}</span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1">공식 사이트 + 공개 IR 기준</span>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </header>

        <section
          className="rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #002D74 0%, #0084C9 100%)' }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                Baseline
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{CLASSYS.nameKo} / {CLASSYS.name}</h2>
                <a
                  href={CLASSYS.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                >
                  {CLASSYS.listed}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="mt-3 text-sm text-blue-100">
                HIFU와 RF를 모두 보유한 에너지 기반 미용장비 회사로서, 프리미엄 시술 시장과 해외 총판 확장이
                핵심입니다. 글로벌 대형사와 비교하면 브랜드 스토리와 교육형 영업이 강점이고, 국내 경쟁사와
                비교하면 HIFU/RF 포트폴리오의 균형이 차별점입니다.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: BarChart3, label: 'Scale', value: CLASSYS.scaleLabel },
                  { icon: TrendingUp, label: 'Momentum', value: `+${CLASSYS.momentum}%` },
                  { icon: Globe, label: 'Key expansion', value: 'Asia, LatAm, North America' },
                  { icon: ShieldAlert, label: 'Direct battle', value: 'HIFU + RF lifting' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl bg-white/10 px-4 py-3">
                    <Icon className="mb-1.5 h-4 w-4 text-blue-100" />
                    <p className="text-[11px] uppercase tracking-wide text-blue-100/80">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-[340px]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Why benchmark</p>
              <ul className="space-y-2 text-sm text-blue-50">
                {CLASSYS.strengths.map((strength) => (
                  <li key={strength} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Domestic signal</p>
            <h2 className="mt-2 text-lg font-bold text-gray-900">국내는 HIFU와 RF가 직접 겹칩니다.</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              멀츠는 HIFU 프리미엄, 원텍과 솔타는 RF 프리미엄, 제이시스와 아스테라시스는 멀티 장비 조합으로
              CLASSYS의 핵심 채널을 공략합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Global peer</p>
            <h2 className="mt-2 text-lg font-bold text-gray-900">글로벌은 RF 복합 솔루션이 강합니다.</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              InMode, Alma, Venus Concept는 단일 장비보다 패키지 판매와 소모품 구조를 강화하고 있습니다.
              CLASSYS도 Volnewmer와 HIFU를 묶는 세일즈 설계가 중요합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Watch list</p>
            <h2 className="mt-2 text-lg font-bold text-gray-900">직접 경쟁 우선순위가 명확합니다.</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              HIFU는 멀츠·아스테라시스·제이시스, RF는 원텍·솔타·InMode, 병원 포트폴리오 예산 경쟁은 Cynosure
              Lutronic과 Alma를 우선 추적하는 것이 합리적입니다.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">포지셔닝 맵</h2>
          <p className="mt-1 text-xs text-gray-500">
            X축은 공개 자료를 바탕으로 한 scale proxy, Y축은 최근 사업 모멘텀입니다. 버블 크기는 기술 카테고리
            커버리지 수를 뜻합니다.
          </p>
          <div className="mt-5 h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis
                  type="number"
                  dataKey="scaleUSD"
                  name="Scale"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  type="number"
                  dataKey="momentum"
                  name="Momentum"
                  unit="%"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 380]} />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '4 4' }} />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="4 4" />
                <Scatter data={positioningData} fill="#002D74" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">국내 경쟁사</h2>
              <p className="text-xs text-gray-500">필수 트래킹 7개사</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setKoFilter(key)}
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    koFilter === key
                      ? 'bg-[#002D74] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                  ].join(' ')}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredKorean.map((item) => (
              <CompetitorCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">글로벌 피어 그룹</h2>
              <p className="text-xs text-gray-500">국내 경쟁 축과 유사한 RF·Laser·패키지형 사업자</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setGlobalFilter(key)}
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    globalFilter === key
                      ? 'bg-[#002D74] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                  ].join(' ')}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredGlobal.map((item) => (
              <CompetitorCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">데이터 메모</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                매출과 모멘텀 수치는 공식 IR, 기업 사이트, 공개 시장 자료를 조합한 벤치마크용 proxy입니다.
                시장 페이지에서는 경쟁 축과 제품 겹침, 포지셔닝 판단에 쓰고, 투자 판단용 절대 수치로는 쓰지 않는
                것이 맞습니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
