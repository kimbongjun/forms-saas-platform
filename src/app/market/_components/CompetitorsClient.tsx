'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
  Megaphone,
  FlaskConical,
  CalendarDays,
} from 'lucide-react'
import MarketNav from './MarketNav'

type ThreatLevel = 'VERY HIGH' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW-MEDIUM'
type FilterKey = 'all' | 'hifu' | 'rf' | 'laser'
type InnerTab = 'positioning' | 'financial' | 'marketing' | 'research' | 'events'

type TechRating = {
  hifu: number
  rf: number
  laser: number
  body: number
  injectables?: number
}

type MarketingData = {
  campaigns: string[]
  kols: string[]
  instagram: number | null
  youtube: number | null
  recentActivities: string[]
}

type ResearchData = {
  papers2024: number
  papers2025: number
  keyJournals?: string[]
  rdInvestment: number
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
  initials: string
  // Financial
  revenue: number
  growth: number
  marketCap: number | null
  rdRate: number
  // Optional extended data
  marketing?: MarketingData
  research?: ResearchData
  // Events: index matches EVENT_LIST
  events?: boolean[]
}

// ─── Color palette (canonical) ───────────────────────────────────────────────
const COLORS: Record<string, string> = {
  CLASSYS: '#002D74',
  InMode: '#e53e3e',
  Cutera: '#dd6b20',
  Candela: '#6b46c1',
  'Venus Concept': '#2b6cb0',
  원텍: '#2f855a',
  아스테라시스: '#b7791f',
  루트로닉: '#702459',
  제이시스: '#2c7a7b',
  텐텍: '#744210',
  멀츠: '#4a5568',
  솔타메디칼: '#c53030',
  Alma: '#553c9a',
  // fallbacks for exact id matches
  merz: '#4a5568',
  solta: '#c53030',
  lutronic: '#702459',
  jeisys: '#2c7a7b',
  wontech: '#2f855a',
  tentec: '#744210',
  asterasys: '#b7791f',
  inmode: '#e53e3e',
  candela: '#6b46c1',
  cynosure: '#553c9a',
  alma: '#553c9a',
  cutera: '#dd6b20',
  venus: '#2b6cb0',
}

const REPORT_DATE = '2026-05-07'

const CLASSYS_DATA = {
  name: 'CLASSYS',
  nameKo: '클래시스',
  listed: 'KOSDAQ 214150',
  scaleLabel: '2025 매출 3,368억 원 / 약 $246M',
  scaleUSD: 246,
  momentum: 38.7,
  revenue: 246,
  growth: 38.7,
  marketCap: 890,
  rdRate: 8.2,
  products: ['Ultraformer', 'Shurink Universe', 'Volnewmer', 'Secret DUO', 'Skinsys'],
  strengths: [
    'HIFU와 RF를 모두 보유한 에너지 기반 리프팅 포트폴리오',
    '아시아에서 강한 유통망과 교육형 세일즈 구조',
    '시술 장비와 소모품, 임상 콘텐츠를 함께 묶는 확장성',
    '브랜드 포지셔닝이 프리미엄이면서도 글로벌 확장 여지 보유',
  ],
  sourceUrl: 'https://classys.co.kr/?kboard_content_redirect=605',
  marketing: {
    campaigns: ['Shurink Universe 글로벌 론칭', 'K-Beauty 브랜드 협업'],
    kols: ['아시아 10개국 KOL 네트워크 150명+'],
    instagram: 32000,
    youtube: 12000,
    recentActivities: ['IMCAS 2026 메인 스폰서', '현지 의사 교육 프로그램'],
  } as MarketingData,
  research: {
    papers2024: 42,
    papers2025: 18,
    keyJournals: ['Lasers in Surgery and Medicine', 'Journal of Cosmetic Dermatology'],
    rdInvestment: 20.2,
  } as ResearchData,
  // AMWC, ASLMS, AAD, KIMES, IMCAS Asia, MEDICA, IMCAS World
  events: [true, true, false, true, true, true, true],
}

// ─── Event list ───────────────────────────────────────────────────────────────
const EVENT_LIST = ['AMWC', 'ASLMS', 'AAD', 'KIMES', 'IMCAS Asia', 'MEDICA', 'IMCAS World']

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
    color: COLORS['멀츠'],
    initials: 'MZ',
    revenue: 95,
    growth: 6.2,
    marketCap: null,
    rdRate: 15.3,
  },
  {
    id: 'solta',
    name: 'Solta Medical Korea',
    nameKo: '솔타메디칼 코리아',
    region: 'korea',
    basedIn: 'USA / Korea',
    scaleLabel: 'RF·Laser 글로벌 프리미엄 브랜드',
    scaleUSD: 420,
    momentum: 3.1,
    overlap: 'Thermage FLX의 RF 리프팅 포지션이 Volnewmer와 환자 수요를 나눕니다.',
    products: ['Thermage FLX', 'Fraxel', 'Clear + Brilliant'],
    focus: ['RF 리프팅', '피부재생', '프리미엄 시술'],
    recentMove: 'Thermage 중심의 프리미엄 리프팅 브랜딩을 지속 확대 중입니다.',
    threat: 'MEDIUM-HIGH',
    tech: { hifu: 0, rf: 5, laser: 4, body: 1 },
    officialUrl: 'https://www.soltamedical.com/',
    sourceLabel: 'Solta Medical',
    color: COLORS['솔타메디칼'],
    initials: 'SL',
    revenue: 420,
    growth: 3.1,
    marketCap: null,
    rdRate: 9.8,
    research: { papers2024: 95, papers2025: 31, rdInvestment: 41.2 },
    events: [true, true, true, false, false, true, true],
  },
  {
    id: 'lutronic',
    name: 'Lutronic',
    nameKo: '루트로닉',
    region: 'korea',
    basedIn: 'Korea / USA',
    scaleLabel: 'Laser 강자, Hologic 계열 시너지',
    scaleUSD: 145,
    momentum: 8.1,
    overlap: '레이저 강점에 더해 에너지 기반 포트폴리오를 확장하며 CLASSYS 영역에 접근합니다.',
    products: ['DermaV', 'LaseMD Ultra', 'Clarity II', 'Genius RF'],
    focus: ['레이저', 'RF', '글로벌 KOL 네트워크'],
    recentMove: '미국 채널 강화와 함께 에너지 기반 미용 포트폴리오를 재정비하고 있습니다.',
    threat: 'MEDIUM-HIGH',
    tech: { hifu: 1, rf: 4, laser: 5, body: 1 },
    officialUrl: 'https://www.lutronic.com/us/',
    sourceLabel: 'Lutronic',
    color: COLORS['루트로닉'],
    initials: 'LT',
    revenue: 145,
    growth: 8.1,
    marketCap: null,
    rdRate: 12.1,
    research: { papers2024: 38, papers2025: 12, rdInvestment: 17.6 },
  },
  {
    id: 'jeisys',
    name: 'Jeisys Medical',
    nameKo: '제이시스메디칼',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'HIFU·RF·Laser 복합 포트폴리오',
    scaleUSD: 52,
    momentum: 19.3,
    overlap: 'LinearZ, Density, Potenza 계열이 CLASSYS의 HIFU·RF와 겹칩니다.',
    products: ['Density', 'LinearZ', 'POTENZA', 'PicoQ'],
    focus: ['에너지 기반 리프팅', '복합 장비 세트업', '해외 총판'],
    recentMove: 'HIFU와 RF를 묶는 패키지 영업으로 병원당 객단가를 높이는 전략을 씁니다.',
    threat: 'HIGH',
    tech: { hifu: 4, rf: 4, laser: 3, body: 1 },
    officialUrl: 'https://www.jeisys.com/',
    sourceLabel: 'Jeisys Medical',
    color: COLORS['제이시스'],
    initials: 'JS',
    revenue: 52,
    growth: 19.3,
    marketCap: 180,
    rdRate: 5.9,
  },
  {
    id: 'wontech',
    name: 'Wontech',
    nameKo: '원텍',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'OLIGIO 중심 RF 확장',
    scaleUSD: 89,
    momentum: 31.2,
    overlap: 'OLIGIO가 Volnewmer와 가장 직접적인 RF 경쟁 축을 형성합니다.',
    products: ['OLIGIO', 'HELIOS', 'PICOCARE', 'Tightan'],
    focus: ['RF 리프팅', '피코 레이저', '해외 유통 확장'],
    recentMove: 'OLIGIO 브랜드 인지도를 앞세운 공격적 마케팅이 이어지고 있습니다.',
    threat: 'HIGH',
    tech: { hifu: 2, rf: 5, laser: 4, body: 1 },
    officialUrl: 'https://wontech.co.kr/',
    sourceLabel: 'Wontech',
    color: COLORS['원텍'],
    initials: 'WT',
    revenue: 89,
    growth: 31.2,
    marketCap: 340,
    rdRate: 7.8,
    marketing: {
      campaigns: ['HIFU 시술 대중화 국내 디지털 마케팅'],
      kols: ['국내 성형외과/피부과 의사 KOL 80명'],
      instagram: 15000,
      youtube: null,
      recentActivities: ['K-Beauty 엑스포 2025 참가'],
    },
    research: { papers2024: 23, papers2025: 11, rdInvestment: 6.9 },
    events: [false, false, false, true, true, false, false],
  },
  {
    id: 'tentec',
    name: 'Tentech',
    nameKo: '텐텍',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'RF 기반 틈새 플레이어',
    scaleUSD: 38,
    momentum: 22.1,
    overlap: '규모는 작지만 RF 시술 장비 영역에서 가격 민감 채널을 공략합니다.',
    products: ['10THERMA', 'LEGATO II', 'TECAR'],
    focus: ['RF', '중저가 채널', '해외 총판형 영업'],
    recentMove: '지역 총판 중심으로 동남아·중남미 채널을 넓히는 흐름입니다.',
    threat: 'LOW-MEDIUM',
    tech: { hifu: 1, rf: 4, laser: 1, body: 1 },
    officialUrl: 'https://www.tentech.co.kr/',
    sourceLabel: 'Tentech',
    color: COLORS['텐텍'],
    initials: 'TT',
    revenue: 38,
    growth: 22.1,
    marketCap: 95,
    rdRate: 4.8,
  },
  {
    id: 'asterasys',
    name: 'Asterasys',
    nameKo: '아스테라시스',
    region: 'korea',
    basedIn: 'Korea',
    scaleLabel: 'Ultracel 계열 HIFU 전문성',
    scaleUSD: 67,
    momentum: 28.9,
    overlap: 'Ultracel 브랜드가 HIFU 시장에서 CLASSYS와 직접 비교됩니다.',
    products: ['Ultracel Q+', 'Ultracel Z+', 'Liftera'],
    focus: ['HIFU', '유럽·중동 채널', '임상 기반 세일즈'],
    recentMove: 'HIFU 적응증 확대와 해외 총판 교육을 강화하고 있습니다.',
    threat: 'MEDIUM-HIGH',
    tech: { hifu: 5, rf: 2, laser: 1, body: 1 },
    officialUrl: 'https://www.asterasys.com/',
    sourceLabel: 'Asterasys',
    color: COLORS['아스테라시스'],
    initials: 'AS',
    revenue: 67,
    growth: 28.9,
    marketCap: 210,
    rdRate: 6.5,
    research: { papers2024: 19, papers2025: 8, rdInvestment: 4.4 },
    events: [false, false, false, true, true, false, false],
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
    scaleUSD: 478,
    momentum: 12.1,
    overlap: 'RF와 안면 리프팅, 바디까지 묶는 패키지로 CLASSYS의 확장 전략과 부딪힙니다.',
    products: ['Morpheus8', 'Forma', 'Evoke', 'EMFACE'],
    focus: ['RF 리프팅', '바디', '멀티 플랫폼 세일즈'],
    recentMove: 'EMFACE와 Morpheus8 조합으로 프리미엄 복합 시술 수요를 키우고 있습니다.',
    threat: 'VERY HIGH',
    tech: { hifu: 1, rf: 5, laser: 1, body: 5 },
    officialUrl: 'https://inmodemd.com/',
    sourceLabel: 'InMode',
    color: COLORS['InMode'],
    initials: 'IN',
    revenue: 478,
    growth: 12.1,
    marketCap: 1850,
    rdRate: 11.3,
    marketing: {
      campaigns: ['"Real Results" 글로벌 KOL 캠페인', '미국 TV CF 시리즈'],
      kols: ['Dr. Doris Day (피부과)', 'Dr. Jason Pozner (성형외과)'],
      instagram: 98000,
      youtube: 45000,
      recentActivities: ['ASDS 2025 골드 스폰서', 'Real Housewives 출연진 협찬'],
    },
    research: {
      papers2024: 89,
      papers2025: 34,
      keyJournals: ['Dermatologic Surgery', 'Aesthetic Surgery Journal'],
      rdInvestment: 54.1,
    },
    events: [true, true, true, false, false, true, true],
  },
  {
    id: 'candela',
    name: 'Candela',
    nameKo: '캔델라',
    region: 'global',
    basedIn: 'USA',
    scaleLabel: '레이저 대형 사업자',
    scaleUSD: 312,
    momentum: 15.2,
    overlap: '레이저 중심이지만 프리미엄 병원 채널 장악력이 높아 경쟁 고객층이 겹칩니다.',
    products: ['GentleMax Pro Plus', 'PicoWay', 'Profound RF'],
    focus: ['레이저', 'RF', '대형 병원 네트워크'],
    recentMove: 'PicoWay와 Profound RF를 묶어 프리미엄 클리닉 업셀링을 강화합니다.',
    threat: 'MEDIUM',
    tech: { hifu: 0, rf: 3, laser: 5, body: 1 },
    officialUrl: 'https://candelamedical.com/',
    sourceLabel: 'Candela',
    color: COLORS['Candela'],
    initials: 'CD',
    revenue: 312,
    growth: 15.2,
    marketCap: null,
    rdRate: 10.5,
    research: { papers2024: 67, papers2025: 28, rdInvestment: 32.8 },
    events: [true, true, true, false, false, true, true],
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
    color: COLORS['Alma'],
    initials: 'CY',
    revenue: 500,
    growth: 11,
    marketCap: null,
    rdRate: 9.0,
  },
  {
    id: 'alma',
    name: 'Alma',
    nameKo: '알마',
    region: 'global',
    basedIn: 'Israel',
    scaleLabel: '멀티 모달리티 장비 기업',
    scaleUSD: 267,
    momentum: 9.4,
    overlap: '레이저와 RF, 환자 교육형 마케팅 역량이 강해 중상위 글로벌 병원 채널에서 겹칩니다.',
    products: ['Harmony XL Pro', 'Soprano Titanium', 'Accent Prime', 'Opus'],
    focus: ['레이저', 'RF', '교육형 마케팅'],
    recentMove: '하이브리드 시술 패키지를 전면에 내세우며 클리닉당 장비 수를 늘립니다.',
    threat: 'MEDIUM',
    tech: { hifu: 0, rf: 4, laser: 5, body: 3 },
    officialUrl: 'https://almaasers.com/',
    sourceLabel: 'Alma',
    color: COLORS['Alma'],
    initials: 'AL',
    revenue: 267,
    growth: 9.4,
    marketCap: null,
    rdRate: 10.1,
  },
  {
    id: 'cutera',
    name: 'Cutera',
    nameKo: '큐테라',
    region: 'global',
    basedIn: 'USA',
    scaleLabel: '구조조정 중인 장비사',
    scaleUSD: 183,
    momentum: -8.4,
    overlap: 'HIFU와 바디, 레이저를 폭넓게 다루며 할인형 제안에서 경쟁합니다.',
    products: ['truSculpt', 'Excel V+', 'enlighten', 'Secret RF'],
    focus: ['바디', 'RF', '피부 레이저'],
    recentMove: '조직 재편 이후 수익성 중심 포트폴리오 운영으로 전환 중입니다.',
    threat: 'MEDIUM',
    tech: { hifu: 1, rf: 4, laser: 4, body: 4 },
    officialUrl: 'https://cutera.com/',
    sourceLabel: 'Cutera',
    color: COLORS['Cutera'],
    initials: 'CU',
    revenue: 183,
    growth: -8.4,
    marketCap: 290,
    rdRate: 9.1,
    marketing: {
      campaigns: ['"truBody" 글로벌 론칭 캠페인'],
      kols: [],
      instagram: 22000,
      youtube: null,
      recentActivities: ['AAD 2025 부스 운영', 'CEO 교체 후 브랜드 리뉴얼'],
    },
    research: { papers2024: 31, papers2025: 9, rdInvestment: 16.7 },
    events: [false, true, true, false, false, true, false],
  },
  {
    id: 'venus',
    name: 'Venus Concept',
    nameKo: '비너스 콘셉트',
    region: 'global',
    basedIn: 'Canada',
    scaleLabel: 'RF·바디 장비 특화',
    scaleUSD: 98,
    momentum: -12.3,
    overlap: 'RF와 바디 패키지 중심으로 멀티 디바이스 제안에서 충돌합니다.',
    products: ['Venus Legacy', 'Venus Viva', 'Venus Bliss MAX'],
    focus: ['RF', '바디', '구독형 서비스 모델'],
    recentMove: '소모품과 서비스형 매출 비중을 높이는 구조를 밀고 있습니다.',
    threat: 'MEDIUM',
    tech: { hifu: 0, rf: 4, laser: 1, body: 5 },
    officialUrl: 'https://venusconcept.com/',
    sourceLabel: 'Venus Concept',
    color: COLORS['Venus Concept'],
    initials: 'VC',
    revenue: 98,
    growth: -12.3,
    marketCap: 45,
    rdRate: 7.2,
  },
]

// ─── All companies for charts ─────────────────────────────────────────────────
const CLASSYS_ENTRY: Competitor = {
  id: 'classys',
  name: 'CLASSYS',
  nameKo: '클래시스',
  region: 'global',
  basedIn: 'Korea',
  scaleLabel: CLASSYS_DATA.scaleLabel,
  scaleUSD: CLASSYS_DATA.scaleUSD,
  momentum: CLASSYS_DATA.momentum,
  overlap: '',
  products: CLASSYS_DATA.products,
  focus: [],
  recentMove: '',
  threat: 'HIGH',
  tech: { hifu: 5, rf: 4, laser: 1, body: 1 },
  officialUrl: CLASSYS_DATA.sourceUrl,
  sourceLabel: 'CLASSYS IR',
  color: COLORS['CLASSYS'],
  initials: 'CL',
  revenue: CLASSYS_DATA.revenue,
  growth: CLASSYS_DATA.growth,
  marketCap: CLASSYS_DATA.marketCap,
  rdRate: CLASSYS_DATA.rdRate,
  marketing: CLASSYS_DATA.marketing,
  research: CLASSYS_DATA.research,
  events: CLASSYS_DATA.events,
}

const ALL_COMPANIES: Competitor[] = [CLASSYS_ENTRY, ...KOREAN_COMPETITORS, ...GLOBAL_COMPETITORS]

const FILTER_LABELS: Record<FilterKey, string> = {
  all: '전체',
  hifu: 'HIFU',
  rf: 'RF',
  laser: 'Laser',
}

const INNER_TAB_LABELS: Record<InnerTab, string> = {
  positioning: '포지셔닝 맵',
  financial: '재무 현황',
  marketing: '마케팅 & 캠페인',
  research: '연구 & 학술',
  events: '전시 & 행사',
}

const INNER_TAB_ICONS: Record<InnerTab, React.ElementType> = {
  positioning: BarChart3,
  financial: TrendingUp,
  marketing: Megaphone,
  research: FlaskConical,
  events: CalendarDays,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function threatColor(level: ThreatLevel) {
  if (level === 'VERY HIGH') return 'bg-red-200 text-red-800'
  if (level === 'HIGH') return 'bg-red-100 text-red-700'
  if (level === 'MEDIUM-HIGH') return 'bg-orange-100 text-orange-700'
  if (level === 'MEDIUM') return 'bg-amber-100 text-amber-700'
  return 'bg-yellow-100 text-yellow-700'
}

function techBreadth(tech: TechRating): number {
  return Object.values(tech).filter((v) => typeof v === 'number' && v >= 3).length
}

function filterCompetitors(list: Competitor[], key: FilterKey) {
  if (key === 'all') return list
  if (key === 'hifu') return list.filter((item) => item.tech.hifu >= 3)
  if (key === 'rf') return list.filter((item) => item.tech.rf >= 3)
  return list.filter((item) => item.tech.laser >= 3)
}

function fmtK(n: number | null) {
  if (n === null) return '비상장'
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Revenue</p>
          <p className="mt-0.5 text-xs font-semibold text-gray-800">${item.revenue}M</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">YoY Growth</p>
          <p className={`mt-0.5 text-xs font-bold ${item.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {item.growth > 0 ? '+' : ''}
            {item.growth}%
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
          {(['hifu', 'rf', 'laser', 'body'] as const).map((key) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="uppercase">{key}</span>
              <RatingDots value={item.tech[key]} color={item.color} />
            </div>
          ))}
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

// ─── D3 Positioning Map ───────────────────────────────────────────────────────
type D3Datum = {
  name: string
  nameKo: string
  revenue: number
  growth: number
  techBreadthVal: number
  color: string
  initials: string
  isClassys: boolean
  products: string[]
}

function PositioningMap({ filter }: { filter: FilterKey }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setContainerWidth(w)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const margin = { top: 40, right: 220, bottom: 60, left: 70 }
    const height = 420 - margin.top - margin.bottom
    const width = Math.max(300, containerWidth - margin.left - margin.right)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    svg
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Build data
    const allEntries = ALL_COMPANIES.map((c) => ({
      name: c.name,
      nameKo: c.nameKo,
      revenue: c.revenue,
      growth: c.growth,
      techBreadthVal: techBreadth(c.tech),
      color: c.color,
      initials: c.initials,
      isClassys: c.id === 'classys',
      products: c.products,
    } as D3Datum))

    let data: D3Datum[]
    if (filter === 'hifu') {
      data = allEntries.filter((_, i) => {
        const tc = ALL_COMPANIES[i].tech
        return tc.hifu >= 3 || ALL_COMPANIES[i].id === 'classys'
      })
    } else if (filter === 'rf') {
      data = allEntries.filter((_, i) => {
        const tc = ALL_COMPANIES[i].tech
        return tc.rf >= 3 || ALL_COMPANIES[i].id === 'classys'
      })
    } else if (filter === 'laser') {
      data = allEntries.filter((_, i) => {
        const tc = ALL_COMPANIES[i].tech
        return tc.laser >= 3 || ALL_COMPANIES[i].id === 'classys'
      })
    } else {
      data = allEntries
    }

    // Scales
    const xExtent = d3.extent(data, (d) => d.revenue) as [number, number]
    const yExtent = d3.extent(data, (d) => d.growth) as [number, number]
    const xPad = (xExtent[1] - xExtent[0]) * 0.12
    const yPad = (yExtent[1] - yExtent[0]) * 0.15

    const xScale = d3
      .scaleLinear()
      .domain([Math.max(0, xExtent[0] - xPad), xExtent[1] + xPad])
      .range([0, width])
      .nice()

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPad, yExtent[1] + yPad])
      .range([height, 0])
      .nice()

    const rScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.techBreadthVal) ?? 4])
      .range([18, 40])

    // Grid lines
    g.append('g')
      .attr('class', 'grid-y')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => ''),
      )
      .select('.domain')
      .remove()
    g.selectAll('.grid-y .tick line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '3,3')

    g.append('g')
      .attr('class', 'grid-x')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => ''),
      )
      .select('.domain')
      .remove()
    g.selectAll('.grid-x .tick line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '3,3')

    // Zero line
    if (yScale(0) > 0 && yScale(0) < height) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', '#94a3b8')
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1)
    }

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat((v) => `$${v}M`))
      .call((ax) => ax.select('.domain').attr('stroke', '#e2e8f0'))
      .call((ax) => ax.selectAll('.tick line').attr('stroke', '#e2e8f0'))
      .call((ax) => ax.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '11'))

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6).tickFormat((v) => `${v}%`))
      .call((ax) => ax.select('.domain').attr('stroke', '#e2e8f0'))
      .call((ax) => ax.selectAll('.tick line').attr('stroke', '#e2e8f0'))
      .call((ax) => ax.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '11'))

    // Axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 48)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12')
      .text('글로벌 매출 (USD M)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -54)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12')
      .text('YoY 성장률 (%)')

    // Tooltip div
    let tooltip = d3.select<HTMLDivElement, unknown>('#d3-tooltip')
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('id', 'd3-tooltip')
        .style('position', 'fixed')
        .style('pointer-events', 'none')
        .style('background', 'white')
        .style('border', '1px solid #e5e7eb')
        .style('border-radius', '12px')
        .style('padding', '10px 14px')
        .style('font-size', '12px')
        .style('box-shadow', '0 4px 16px rgba(0,0,0,0.1)')
        .style('z-index', '9999')
        .style('display', 'none')
        .style('max-width', '220px')
    }

    // Bubbles
    const node = g
      .selectAll('.bubble')
      .data(data)
      .join('g')
      .attr('class', 'bubble')
      .attr('transform', (d) => `translate(${xScale(d.revenue)},${yScale(d.growth)})`)
      .style('cursor', 'pointer')

    // CLASSYS: star shape, others: circle
    node.each(function (d) {
      const el = d3.select(this)
      if (d.isClassys) {
        // Star polygon
        const r = rScale(d.techBreadthVal)
        const starPath = starPolygon(r * 1.1, r * 0.5, 5)
        el.append('path')
          .attr('d', starPath)
          .attr('fill', d.color)
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .attr('filter', 'drop-shadow(0 2px 6px rgba(0,45,116,0.4))')
      } else {
        el.append('circle')
          .attr('r', rScale(d.techBreadthVal))
          .attr('fill', d.color)
          .attr('fill-opacity', 0.85)
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
      }
      // Initials text
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('dy', d.isClassys ? '1' : '0')
        .attr('fill', 'white')
        .attr('font-size', '10')
        .attr('font-weight', '700')
        .attr('pointer-events', 'none')
        .text(d.initials)
    })

    // Hover events
    node
      .on('mouseover', function (event: MouseEvent, d: D3Datum) {
        tooltip
          .style('display', 'block')
          .html(
            `<div style="font-weight:700;color:#111;margin-bottom:4px">${d.nameKo} (${d.name})</div>` +
              `<div style="color:#6b7280">매출: <b style="color:#111">$${d.revenue}M</b></div>` +
              `<div style="color:#6b7280">성장률: <b style="${d.growth >= 0 ? 'color:#059669' : 'color:#dc2626'}">${d.growth >= 0 ? '+' : ''}${d.growth}%</b></div>` +
              `<div style="color:#6b7280">기술 폭: <b style="color:#111">${d.techBreadthVal}</b></div>` +
              `<div style="color:#6b7280;margin-top:4px;font-size:11px">${d.products.slice(0, 3).join(', ')}</div>`,
          )
      })
      .on('mousemove', function (event: MouseEvent) {
        tooltip.style('left', `${event.clientX + 14}px`).style('top', `${event.clientY - 10}px`)
      })
      .on('mouseout', function () {
        tooltip.style('display', 'none')
      })

    // Legend (right side)
    const legendG = svg
      .append('g')
      .attr('transform', `translate(${margin.left + width + 16},${margin.top})`)

    legendG
      .append('text')
      .attr('y', -10)
      .attr('font-size', '11')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text('회사')

    data.forEach((d, i) => {
      const row = legendG.append('g').attr('transform', `translate(0,${i * 20})`)
      if (d.isClassys) {
        row
          .append('path')
          .attr('d', starPolygon(6, 3, 5))
          .attr('transform', 'translate(6,0)')
          .attr('fill', d.color)
      } else {
        row
          .append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('y', -6)
          .attr('rx', 3)
          .attr('fill', d.color)
      }
      row
        .append('text')
        .attr('x', 18)
        .attr('y', 0)
        .attr('dominant-baseline', 'central')
        .attr('font-size', '10')
        .attr('fill', '#374151')
        .text(d.isClassys ? `★ ${d.nameKo}` : d.nameKo)
    })

    // Bubble size legend
    const sizeLegendY = data.length * 20 + 30
    legendG
      .append('text')
      .attr('y', sizeLegendY)
      .attr('font-size', '10')
      .attr('fill', '#9ca3af')
      .text('버블 = 기술 폭')

    return () => {
      d3.select('#d3-tooltip').remove()
    }
  }, [containerWidth, filter])

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  )
}

// Star polygon path helper
function starPolygon(outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points
  const coords: [number, number][] = []
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * step - Math.PI / 2
    coords.push([r * Math.cos(angle), r * Math.sin(angle)])
  }
  return `M${coords.map((c) => c.join(',')).join('L')}Z`
}

// ─── Financial Tab ────────────────────────────────────────────────────────────
function FinancialTab() {
  const companies = ALL_COMPANIES.filter((c) => [
    'classys', 'inmode', 'cutera', 'candela', 'wontech', 'asterasys',
    'lutronic', 'jeisys', 'solta', 'venus', 'alma',
  ].includes(c.id))

  const revenueData = [...companies]
    .sort((a, b) => b.revenue - a.revenue)
    .map((c) => ({ name: c.id === 'classys' ? '클래시스' : c.nameKo, revenue: c.revenue, color: c.color }))

  const growthData = [...companies]
    .sort((a, b) => b.growth - a.growth)
    .map((c) => ({ name: c.id === 'classys' ? '클래시스' : c.nameKo, growth: c.growth, color: c.color }))

  const rdData = [...companies]
    .sort((a, b) => b.rdRate - a.rdRate)
    .map((c) => ({ name: c.id === 'classys' ? '클래시스' : c.nameKo, rdRate: c.rdRate, color: c.color }))

  return (
    <div className="flex flex-col gap-8">
      {/* Revenue bar chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-bold text-gray-900">매출 비교 (USD M, 2025)</h3>
        <p className="mb-5 text-xs text-gray-500">공개 IR 및 추정치 기준</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueData} margin={{ top: 4, right: 8, bottom: 40, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}M`}
            />
            <Tooltip formatter={(value) => [`$${value}M`, '매출']} />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {revenueData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Growth bar chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-bold text-gray-900">YoY 성장률 비교 (%)</h3>
        <p className="mb-5 text-xs text-gray-500">최근 1년 기준</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={growthData} margin={{ top: 4, right: 8, bottom: 40, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip formatter={(value) => [`${value}%`, 'YoY 성장률']} />
            <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
              {growthData.map((entry, i) => (
                <Cell key={i} fill={entry.growth >= 0 ? entry.color : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* R&D Rate */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-bold text-gray-900">R&D 투자율 비교 (%)</h3>
        <p className="mb-5 text-xs text-gray-500">매출 대비 R&D 비용 기준</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rdData} margin={{ top: 4, right: 8, bottom: 40, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip formatter={(value) => [`${value}%`, 'R&D 투자율']} />
            <Bar dataKey="rdRate" radius={[4, 4, 0, 0]}>
              {rdData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Market cap table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">시가총액 비교</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="pb-2 font-medium">회사</th>
                <th className="pb-2 font-medium">매출</th>
                <th className="pb-2 font-medium">성장률</th>
                <th className="pb-2 font-medium">시가총액</th>
                <th className="pb-2 font-medium">R&D율</th>
              </tr>
            </thead>
            <tbody>
              {[...companies].sort((a, b) => b.revenue - a.revenue).map((c) => (
                <tr key={c.id} className={`border-b border-gray-50 ${c.id === 'classys' ? 'bg-blue-50/50' : ''}`}>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className={`font-medium ${c.id === 'classys' ? 'text-[#002D74]' : 'text-gray-800'}`}>
                        {c.id === 'classys' ? '★ 클래시스' : c.nameKo}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-700">${c.revenue}M</td>
                  <td className={`py-2.5 font-medium ${c.growth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {c.growth >= 0 ? '+' : ''}{c.growth}%
                  </td>
                  <td className="py-2.5 text-gray-700">{fmtK(c.marketCap)}</td>
                  <td className="py-2.5 text-gray-700">{c.rdRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Marketing Tab ────────────────────────────────────────────────────────────
function MarketingTab() {
  const withMarketing = ALL_COMPANIES.filter((c) => c.marketing)

  return (
    <div className="flex flex-col gap-6">
      {withMarketing.map((c) => (
        <div
          key={c.id}
          className={`rounded-2xl border p-5 shadow-sm ${c.id === 'classys' ? 'border-[#002D74]/20 bg-[#002D74]/5' : 'border-gray-100 bg-white'}`}
        >
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.initials}
            </span>
            <div>
              <p className={`text-sm font-bold ${c.id === 'classys' ? 'text-[#002D74]' : 'text-gray-900'}`}>
                {c.id === 'classys' ? `★ ${c.nameKo}` : c.nameKo}
              </p>
              <p className="text-xs text-gray-500">{c.name}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">주요 캠페인</p>
              <ul className="space-y-1">
                {c.marketing!.campaigns.map((cam) => (
                  <li key={cam} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    {cam}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">주요 KOL</p>
              <ul className="space-y-1">
                {c.marketing!.kols.length > 0 ? (
                  c.marketing!.kols.map((kol) => (
                    <li key={kol} className="flex items-start gap-1.5 text-xs text-gray-700">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                      {kol}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400">데이터 없음</li>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">SNS 팔로워</p>
              <div className="space-y-1.5">
                {c.marketing!.instagram !== null && (
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-semibold text-pink-600">IG</span>
                    {c.marketing!.instagram.toLocaleString()}
                  </div>
                )}
                {c.marketing!.youtube !== null && (
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">YT</span>
                    {c.marketing!.youtube.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">최근 활동</p>
              <ul className="space-y-1">
                {c.marketing!.recentActivities.map((act) => (
                  <li key={act} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Research Tab ─────────────────────────────────────────────────────────────
function ResearchTab() {
  const withResearch = ALL_COMPANIES.filter((c) => c.research)
    .sort((a, b) => (b.research?.papers2024 ?? 0) - (a.research?.papers2024 ?? 0))

  const paperData = withResearch.map((c) => ({
    name: c.id === 'classys' ? '클래시스' : c.nameKo,
    '2024년': c.research?.papers2024 ?? 0,
    '2025년': c.research?.papers2025 ?? 0,
    color: c.color,
  }))

  return (
    <div className="flex flex-col gap-8">
      {/* Papers bar chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-sm font-bold text-gray-900">임상논문 발표 수</h3>
        <p className="mb-5 text-xs text-gray-500">주요 피어리뷰 저널 기준 (SCI/SCIE)</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paperData} margin={{ top: 4, right: 8, bottom: 40, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="2024년" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2025년" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* R&D investment table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">R&D 투자 & 학술 활동 요약</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="pb-2 font-medium">회사</th>
                <th className="pb-2 font-medium">논문 (2024)</th>
                <th className="pb-2 font-medium">논문 (2025)</th>
                <th className="pb-2 font-medium">R&D 투자 (USD M)</th>
                <th className="pb-2 font-medium">주요 저널</th>
              </tr>
            </thead>
            <tbody>
              {withResearch.map((c) => (
                <tr key={c.id} className={`border-b border-gray-50 ${c.id === 'classys' ? 'bg-blue-50/50' : ''}`}>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className={`font-medium ${c.id === 'classys' ? 'text-[#002D74]' : 'text-gray-800'}`}>
                        {c.id === 'classys' ? '★ 클래시스' : c.nameKo}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-700">{c.research?.papers2024}</td>
                  <td className="py-2.5 text-gray-700">{c.research?.papers2025}</td>
                  <td className="py-2.5 font-medium text-gray-700">${c.research?.rdInvestment}M</td>
                  <td className="py-2.5 text-xs text-gray-500">
                    {c.research?.keyJournals?.join(', ') ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Events Tab ───────────────────────────────────────────────────────────────
function EventsTab() {
  const withEvents = ALL_COMPANIES.filter((c) => c.events)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-bold text-gray-900">2025~2026 글로벌 학회·전시 참가 현황</h3>
      <p className="mb-5 text-xs text-gray-500">공식 발표 및 협력사 확인 기준</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-left text-xs font-medium text-gray-400">회사</th>
              {EVENT_LIST.map((ev) => (
                <th key={ev} className="pb-3 text-center text-xs font-medium text-gray-400">
                  {ev}
                </th>
              ))}
              <th className="pb-3 text-center text-xs font-medium text-gray-400">총계</th>
            </tr>
          </thead>
          <tbody>
            {withEvents.map((c) => {
              const evList = c.events ?? []
              const total = evList.filter(Boolean).length
              return (
                <tr
                  key={c.id}
                  className={`border-b border-gray-50 ${c.id === 'classys' ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className={`font-medium ${c.id === 'classys' ? 'text-[#002D74]' : 'text-gray-800'}`}>
                        {c.id === 'classys' ? '★ 클래시스' : c.nameKo}
                      </span>
                    </div>
                  </td>
                  {evList.map((present, idx) => (
                    <td key={idx} className="py-3 text-center">
                      {present ? (
                        <span className="text-base leading-none">✅</span>
                      ) : (
                        <span className="text-base leading-none text-gray-300">❌</span>
                      )}
                    </td>
                  ))}
                  <td className="py-3 text-center">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: `${c.color}20`,
                        color: c.color,
                      }}
                    >
                      {total}/{EVENT_LIST.length}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4">
        {EVENT_LIST.map((ev) => (
          <div key={ev} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-600">{ev}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function CompetitorsClient() {
  const [innerTab, setInnerTab] = useState<InnerTab>('positioning')
  const [koFilter, setKoFilter] = useState<FilterKey>('all')
  const [globalFilter, setGlobalFilter] = useState<FilterKey>('all')
  const [posFilter, setPosFilter] = useState<FilterKey>('all')

  const filteredKorean = filterCompetitors(KOREAN_COMPETITORS, koFilter)
  const filteredGlobal = filterCompetitors(GLOBAL_COMPETITORS, globalFilter)

  return (
    <div className="min-h-full bg-gray-50">
      <MarketNav />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Competitors</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">CLASSYS 경쟁사 백과사전</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              국내·글로벌 에너지 기반 미용장비 경쟁사 13개사를 재무, 마케팅, 연구, 전시 4개 축으로 분석합니다.
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

        {/* CLASSYS Baseline */}
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
                <h2 className="text-2xl font-bold">{CLASSYS_DATA.nameKo} / {CLASSYS_DATA.name}</h2>
                <a
                  href={CLASSYS_DATA.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                >
                  {CLASSYS_DATA.listed}
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
                  { icon: BarChart3, label: 'Revenue', value: CLASSYS_DATA.scaleLabel },
                  { icon: TrendingUp, label: 'YoY Growth', value: `+${CLASSYS_DATA.growth}%` },
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
                {CLASSYS_DATA.strengths.map((strength) => (
                  <li key={strength} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Summary cards */}
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

        {/* Inner Tab navigation */}
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {(Object.keys(INNER_TAB_LABELS) as InnerTab[]).map((tab) => {
              const Icon = INNER_TAB_ICONS[tab]
              return (
                <button
                  key={tab}
                  onClick={() => setInnerTab(tab)}
                  className={[
                    'flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition-colors',
                    innerTab === tab
                      ? 'border-[#002D74] text-[#002D74]'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {INNER_TAB_LABELS[tab]}
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {/* Positioning Map */}
            {innerTab === 'positioning' && (
              <div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">포지셔닝 맵</h2>
                    <p className="text-xs text-gray-500">
                      X축: 글로벌 매출(USD M), Y축: YoY 성장률(%), 버블 크기: 기술 폭(tech breadth)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setPosFilter(key)}
                        className={[
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          posFilter === key
                            ? 'bg-[#002D74] text-white'
                            : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                        ].join(' ')}
                      >
                        {FILTER_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>
                <PositioningMap filter={posFilter} />
              </div>
            )}

            {/* Financial */}
            {innerTab === 'financial' && <FinancialTab />}

            {/* Marketing */}
            {innerTab === 'marketing' && <MarketingTab />}

            {/* Research */}
            {innerTab === 'research' && <ResearchTab />}

            {/* Events */}
            {innerTab === 'events' && <EventsTab />}
          </div>
        </section>

        {/* Competitor card sections */}
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

        {/* Data note */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">데이터 메모</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                매출과 성장률 수치는 공식 IR, 기업 사이트, 공개 시장 자료를 조합한 벤치마크용 proxy입니다.
                경쟁 축과 제품 겹침, 포지셔닝 판단에 쓰고, 투자 판단용 절대 수치로는 쓰지 않는 것이 맞습니다.
                시총 null = 비상장 또는 모회사 자회사로 개별 집계 불가.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
