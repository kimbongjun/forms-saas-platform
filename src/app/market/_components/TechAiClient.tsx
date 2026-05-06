'use client'

import { useState } from 'react'
import { RefreshCw, ExternalLink, Clock, CheckCircle, AlertCircle, Cpu, Zap } from 'lucide-react'
import MarketNav from './MarketNav'

type FilterKey = 'all' | 'tech' | 'ai' | 'regulatory'

interface Article {
  id: string
  category: 'tech' | 'ai' | 'regulatory'
  title: string
  source: string
  date: string
  summary: string
  insight: string
  tags: string[]
  url?: string
}

const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'tech',
    title: 'HIFU 2.0: Real-Time Tissue Imaging Integration in Next-Gen Focused Ultrasound Platforms',
    source: 'Lasers in Surgery and Medicine',
    date: '2026-05-05',
    summary: '차세대 HIFU 플랫폼에 실시간 조직 이미징을 통합하는 임상 연구 결과 발표. 타깃 조직 가시화로 시술 정밀도가 기존 대비 28% 향상되었으며, 부작용 발생률은 41% 감소.',
    insight: '실시간 이미징 탑재 HIFU는 프리미엄 포지셔닝 가능. 클래시스 VOLNEWMER 경쟁 우위 포인트로 활용 가능.',
    tags: ['HIFU', 'Focused Ultrasound', 'Imaging', 'Clinical Study'],
    url: '#',
  },
  {
    id: '2',
    category: 'tech',
    title: "InMode Unveils EMFACE PRO: Next-Generation Facial Remodeling with Upgraded RF + HIFES",
    source: 'MassDevice',
    date: '2026-05-04',
    summary: 'InMode가 EMFACE PRO를 공개. 기존 EMFACE 대비 RF 에너지 출력 40% 향상, HIFES 근육 자극 주파수 최적화. 아이리프팅 기능 새롭게 추가. FDA 510(k) 신청 완료.',
    insight: 'InMode 제품 라인 고도화가 RF+EMS 복합 카테고리를 확장. 국내 경쟁사들도 복합 모달리티 개발 가속화 예상.',
    tags: ['RF', 'EMFACE', 'InMode', 'EMS'],
  },
  {
    id: '3',
    category: 'tech',
    title: 'Cutera Receives CE Mark for New Ultra-Focused Ultrasound System',
    source: 'Fierce Biotech',
    date: '2026-05-03',
    summary: "Cutera의 새 HIFU 시스템이 CE 마크를 획득하며 유럽 시장 진출. Q3 유럽 출시 예정이며, 비침습적 피부 리프팅 및 바디 컨투어링에 CE 적응증 포함.",
    insight: 'Cutera의 유럽 진출로 HIFU 시장 내 가격 경쟁 심화 가능성. VOLNEWMER 유럽 파트너사 지원 강화 전략 검토 권고.',
    tags: ['Cutera', 'CE Mark', 'Europe', 'Body Contouring'],
  },
  {
    id: '4',
    category: 'ai',
    title: 'Canfield Scientific Partners with DeepDerm for AI-Powered Skin Analysis Platform',
    source: 'Aesthetic Medical Partnership',
    date: '2026-05-05',
    summary: 'Canfield Scientific이 DeepDerm과 파트너십을 체결, AI 기반 피부 분석 플랫폼 통합 발표. 시술 전후 비교 자동화, 피부 나이 예측, 치료 반응 예측 기능 포함.',
    insight: '시술 결과 객관화 도구가 환자 설득력을 높임. AI 분석툴 탑재 기기를 선호하는 클리닉 트렌드에 주목.',
    tags: ['AI', 'Skin Analysis', 'Canfield', 'DeepDerm'],
  },
  {
    id: '5',
    category: 'ai',
    title: 'Revian Receives SaMD Registration for AI Skin Condition Tracking Application',
    source: 'FDA.gov',
    date: '2026-05-02',
    summary: 'Revian이 AI 기반 피부 상태 추적 앱(SaMD)에 대한 FDA 등록을 완료. 적외선 기반 skin tone 분석과 치료 효과 추적 기능이 핵심.',
    insight: 'SaMD 시장 확장이 의료기기-앱 번들 모델을 가능하게 함. 하드웨어 단독 판매에서 서비스 구독 모델로의 전환 신호.',
    tags: ['SaMD', 'FDA', 'Revian', 'Mobile App'],
  },
  {
    id: '6',
    category: 'regulatory',
    title: 'FDA Publishes Draft Guidance on Predetermined Change Control Plans for AI/ML-Based Medical Devices',
    source: 'FDA.gov',
    date: '2026-05-01',
    summary: 'FDA가 AI/ML 기반 의료기기의 사전변경관리계획(PCCP) 가이던스 초안을 공개. 알고리즘 업데이트 시 재심사 면제 조건 명확화.',
    insight: 'AI 의료기기 후속 업데이트 부담 완화 → 개발사들의 AI 기능 추가 속도 가속화 예상.',
    tags: ['FDA', 'AI/ML', 'PCCP', 'Regulatory'],
  },
  {
    id: '7',
    category: 'regulatory',
    title: 'EU MDR Extension Discussion: Class IIa Devices May Get Deadline Relief Until 2027',
    source: 'MedTech Europe',
    date: '2026-04-30',
    summary: 'EU 집행위원회가 Class IIa 의료기기 MDR 전환 기한을 2027년까지 연장하는 방안을 논의 중. 인증기관(Notified Body) 병목 해소를 위한 잠정 조치.',
    insight: 'EU 진출 타임라인 여유 확보. 반면, 선제적 MDR 인증 완료 기업이 경쟁 우위를 점할 기회.',
    tags: ['EU MDR', 'Class IIa', 'Notified Body', 'Regulation'],
  },
  {
    id: '8',
    category: 'regulatory',
    title: 'South Korea MFDS Updates Guidance on Clinical Evidence Requirements for Aesthetic Devices',
    source: 'MFDS Korea',
    date: '2026-04-29',
    summary: '식품의약품안전처가 의료미용기기 임상적 근거 요건 가이던스를 개정. RCT 또는 동등성 시험 자료를 의무화하는 방향으로 기준 강화.',
    insight: '국내 허가 절차 강화로 신제품 출시 리드타임 증가 예상. 임상 설계 단계부터 규제 요건 반영 필요.',
    tags: ['MFDS', 'Korea', 'Clinical Evidence', 'Aesthetic Devices'],
  },
]

const REGULATORY_UPDATES = [
  { device: 'EMFACE PRO (InMode)', type: 'FDA 510(k)', status: 'pending', date: '2026-05-04', region: 'USA' },
  { device: 'New HIFU System (Cutera)', type: 'CE Mark', status: 'approved', date: '2026-05-03', region: 'EU' },
  { device: 'AI Skin App (Revian)', type: 'SaMD Registration', status: 'approved', date: '2026-05-02', region: 'USA' },
  { device: 'VOLNEWMER v2 (Classys)', type: 'NMPA', status: 'pending', date: '2026-04-28', region: 'China' },
  { device: 'PicoWay Resolve (Candela)', type: 'CE Mark', status: 'approved', date: '2026-04-25', region: 'EU' },
]

const CATEGORY_LABELS: Record<string, string> = { tech: 'Technology', ai: 'AI / SaMD', regulatory: 'Regulatory' }
const CATEGORY_COLORS: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700',
  ai: 'bg-purple-100 text-purple-700',
  regulatory: 'bg-amber-100 text-amber-700',
}

export default function TechAiClient() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-05-06 08:30')

  const filtered = filter === 'all' ? ARTICLES : ARTICLES.filter((a) => a.category === filter)

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
      <div className="border-b border-gray-100 bg-white px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tech & AI Watch</h1>
            <p className="mt-0.5 text-sm text-gray-500">기술 동향 · AI/SaMD · 규제 승인 현황</p>
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

      <div className="flex-1 gap-6 p-6 max-w-6xl mx-auto w-full lg:grid lg:grid-cols-[1fr_280px]">
        {/* 메인: 아티클 목록 */}
        <div className="min-w-0">
          {/* 필터 탭 */}
          <div className="mb-5 flex gap-1.5">
            {(['all', 'tech', 'ai', 'regulatory'] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                  filter === key
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ].join(' ')}
                style={filter === key ? { background: '#002D74' } : {}}
              >
                {key === 'tech' && <Cpu className="h-3.5 w-3.5" />}
                {key === 'ai' && <Zap className="h-3.5 w-3.5" />}
                {key === 'all' ? '전체' : CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>

          {/* 아티클 카드 */}
          <div className="space-y-4">
            {filtered.map((article) => (
              <article key={article.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[article.category]}`}>
                      {CATEGORY_LABELS[article.category]}
                    </span>
                    <span className="text-xs text-gray-400">{article.source}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{article.date}</span>
                  </div>
                  {article.url && (
                    <a href={article.url} className="shrink-0 text-gray-400 hover:text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <h3 className="mb-2 text-sm font-semibold leading-snug" style={{ color: '#2C3E50' }}>
                  {article.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-600">{article.summary}</p>

                <div className="rounded-xl p-3" style={{ background: 'rgba(0, 45, 116, 0.04)', borderLeft: '3px solid #002D74' }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#002D74' }}>비즈니스 시사점</p>
                  <p className="text-xs leading-relaxed text-gray-700">{article.insight}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 사이드바: 규제 트래커 */}
        <div className="mt-6 lg:mt-0">
          <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: '#2C3E50' }}>Regulatory Tracker</h2>
            <p className="mb-4 text-xs text-gray-400">최근 FDA/CE 승인 현황</p>
            <div className="space-y-3">
              {REGULATORY_UPDATES.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {item.status === 'approved'
                    ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug text-gray-800">{item.device}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{item.type}</span>
                      <span className="rounded px-1.5 py-0.5 text-xs font-medium" style={{ background: item.region === 'USA' ? '#e3f0fb' : item.region === 'EU' ? '#e8f5e9' : '#fff8e1', color: item.region === 'USA' ? '#0084C9' : item.region === 'EU' ? '#2e7d32' : '#f57f17' }}>
                        {item.region}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
