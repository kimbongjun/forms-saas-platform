'use client'

import { useState } from 'react'
import {
  RefreshCw, Cpu, Users, CalendarDays, Globe, Shield,
  TrendingUp, ExternalLink, Clock, Zap,
} from 'lucide-react'
import MarketNav from './MarketNav'

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

export default function DailyReportClient() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const now = new Date()
    setLastUpdated(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setRefreshing(false)
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <MarketNav />

      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100 px-6 py-5" style={{ background: 'linear-gradient(135deg, #002D74 0%, #0084C9 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-1">
              <Globe className="h-3.5 w-3.5" />
              <span>Global Medical Aesthetics Market</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{REPORT_DATE} Daily Report</h1>
            <p className="mt-1 text-blue-200 text-sm">글로벌 피부미용의료기기 시장 동향 자동 요약</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white transition-all hover:bg-white/20 disabled:opacity-60"
          >
            <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
            {refreshing ? '수집 중...' : '새로고침'}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-300">
          <Clock className="h-3 w-3" />
          <span>마지막 업데이트: {lastUpdated}</span>
          <span className="mx-1 text-blue-500">·</span>
          <span>1시간 자동 갱신</span>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
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
                <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  기사 {card.count}건
                </span>
              </div>

              <ul className="space-y-2 mb-3">
                {card.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" style={{ color: 'inherit' }} />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl bg-white/60 px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">비즈니스 시사점</p>
                <p className="text-xs text-gray-700 leading-relaxed">{card.insight}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 트렌딩 해시태그 */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: '#2C3E50' }}>
            오늘의 트렌딩 키워드
          </h2>
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
              'Google News', 'PubMed', 'FDA.gov', 'CE Marking', 'LinkedIn', 'MassDevice',
              'Fierce Biotech', 'Aesthetic Authority', 'Lasers in Surgery and Medicine',
            ].map((src) => (
              <span key={src} className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                <ExternalLink className="h-3 w-3 text-gray-400" />
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
