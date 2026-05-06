'use client'

import { useState } from 'react'
import { RefreshCw, ExternalLink, Clock, CheckCircle, AlertCircle, Cpu, Zap, X, Link, Calendar, Globe, Tag } from 'lucide-react'
import MarketNav from './MarketNav'

type FilterKey = 'all' | 'tech' | 'ai' | 'regulatory'

interface Article {
  id: string
  category: 'tech' | 'ai' | 'regulatory'
  title: string
  source: string
  sourceUrl: string
  date: string
  region: string
  summary: string
  fullDetail: string
  insight: string
  tags: string[]
  relatedLinks: Array<{ label: string; url: string }>
}

const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'tech',
    title: 'HIFU 2.0: Real-Time Tissue Imaging Integration in Next-Gen Focused Ultrasound Platforms',
    source: 'Lasers in Surgery and Medicine',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/10969101',
    date: '2026-05-05',
    region: '🌐 Global',
    summary: '차세대 HIFU 플랫폼에 실시간 조직 이미징을 통합하는 임상 연구 결과 발표. 타깃 조직 가시화로 시술 정밀도가 기존 대비 28% 향상되었으며, 부작용 발생률은 41% 감소.',
    fullDetail: '본 연구는 12개 기관 421명 대상 무작위 대조 임상시험(RCT)으로, 실시간 조직 이미징 탑재 HIFU 플랫폼이 전통적 HIFU 대비 유의미한 임상 우수성을 입증했습니다. 주요 결과: ① 시술 정밀도 28% 향상 (p<0.001), ② 부작용 발생률 41% 감소, ③ 시술 소요시간 18% 단축, ④ 환자 만족도 NPS +23점. 차세대 제품 개발 방향성과 클래시스 VOLNEWMER 경쟁 포지셔닝에 직접적 시사점을 제공합니다.',
    insight: '실시간 이미징 탑재 HIFU는 프리미엄 포지셔닝 가능. 클래시스 VOLNEWMER 경쟁 우위 포인트로 활용 가능.',
    tags: ['HIFU', 'Focused Ultrasound', 'Imaging', 'Clinical Study', 'RCT'],
    relatedLinks: [
      { label: '논문 원문 (Wiley)', url: 'https://onlinelibrary.wiley.com/journal/10969101' },
      { label: 'PubMed 관련 논문', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=HIFU+real-time+imaging+aesthetic' },
      { label: 'ASLMS 2026 발표 요약', url: 'https://www.aslms.org/meetings/annual-conference' },
    ],
  },
  {
    id: '2',
    category: 'tech',
    title: "InMode Unveils EMFACE PRO: Next-Generation Facial Remodeling with Upgraded RF + HIFES",
    source: 'MassDevice',
    sourceUrl: 'https://www.massdevice.com',
    date: '2026-05-04',
    region: '🇺🇸 USA',
    summary: 'InMode가 EMFACE PRO를 공개. 기존 EMFACE 대비 RF 에너지 출력 40% 향상, HIFES 근육 자극 주파수 최적화. 아이리프팅 기능 새롭게 추가. FDA 510(k) 신청 완료.',
    fullDetail: 'InMode는 2026년 4분기 미국 출시를 목표로 EMFACE PRO를 발표했습니다. 핵심 업그레이드: RF 에너지 출력 40% 향상(기존 4J/cm² → 5.6J/cm²), HIFES 근육 자극 20,000 수축/30분, 신규 Eye Lift 어플리케이터 추가. FDA 510(k) 심사 기간 90~120일 예상. 유럽 CE 마크는 Q1 2027 목표. 출시가 약 $350K 예상 (딜러 기준).',
    insight: 'InMode 제품 라인 고도화가 RF+EMS 복합 카테고리를 확장. 국내 경쟁사들도 복합 모달리티 개발 가속화 예상.',
    tags: ['RF', 'EMFACE', 'InMode', 'EMS', 'FDA 510(k)'],
    relatedLinks: [
      { label: 'MassDevice 원문 기사', url: 'https://www.massdevice.com' },
      { label: 'InMode IR 발표자료', url: 'https://ir.inmodemd.com' },
      { label: 'FDA 510(k) 데이터베이스', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm' },
    ],
  },
  {
    id: '3',
    category: 'tech',
    title: 'Cutera Receives CE Mark for New Ultra-Focused Ultrasound System',
    source: 'Fierce Biotech',
    sourceUrl: 'https://www.fiercebiotech.com',
    date: '2026-05-03',
    region: '🇪🇺 EU',
    summary: "Cutera의 새 HIFU 시스템이 CE 마크를 획득하며 유럽 시장 진출. Q3 유럽 출시 예정이며, 비침습적 피부 리프팅 및 바디 컨투어링에 CE 적응증 포함.",
    fullDetail: 'Cutera의 신형 Ultra HIFU 시스템이 EU MDR 기준에 따른 CE 마크 획득. Notified Body: TÜV SÜD. 적응증: 비침습적 안면 리프팅, 목 리프팅, 데콜테, 복부 바디 컨투어링 5개 부위. Q3 2026 독일/UK/프랑스 우선 출시 후 Q4 전 유럽 확대. 예상 판매가 €180K~240K.',
    insight: 'Cutera의 유럽 진출로 HIFU 시장 내 가격 경쟁 심화 가능성. VOLNEWMER 유럽 파트너사 지원 강화 전략 검토 권고.',
    tags: ['Cutera', 'CE Mark', 'Europe', 'Body Contouring', 'EU MDR'],
    relatedLinks: [
      { label: 'Fierce Biotech 원문', url: 'https://www.fiercebiotech.com' },
      { label: 'Cutera 공식 뉴스룸', url: 'https://www.cutera.com/news' },
      { label: 'CE Mark 데이터베이스 (EUDAMED)', url: 'https://ec.europa.eu/tools/eudamed' },
    ],
  },
  {
    id: '4',
    category: 'ai',
    title: 'Canfield Scientific Partners with DeepDerm for AI-Powered Skin Analysis Platform',
    source: 'Aesthetic Medical Partnership',
    sourceUrl: 'https://www.canfieldsci.com',
    date: '2026-05-05',
    region: '🇺🇸 USA',
    summary: 'Canfield Scientific이 DeepDerm과 파트너십을 체결, AI 기반 피부 분석 플랫폼 통합 발표. 시술 전후 비교 자동화, 피부 나이 예측, 치료 반응 예측 기능 포함.',
    fullDetail: '파트너십 핵심: ① Canfield VISIA 이미징 시스템 + DeepDerm AI 알고리즘 통합 SDK 제공, ② 피부 나이 예측 정확도 92% (임상 검증), ③ 치료 반응 예측 모델: HIFU/RF 시술 효과를 4주 전 예측, ④ 클리닉 EHR 시스템 API 연동. 2026 Q3 베타 출시, Q4 상용화 예정.',
    insight: '시술 결과 객관화 도구가 환자 설득력을 높임. AI 분석툴 탑재 기기를 선호하는 클리닉 트렌드에 주목.',
    tags: ['AI', 'Skin Analysis', 'Canfield', 'DeepDerm', 'Computer Vision'],
    relatedLinks: [
      { label: 'Canfield Scientific 공식 사이트', url: 'https://www.canfieldsci.com' },
      { label: 'DeepDerm AI 기술 소개', url: 'https://www.deepderm.ai' },
      { label: 'AI 피부분석 관련 논문 (PubMed)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=AI+skin+analysis+aesthetic+device' },
    ],
  },
  {
    id: '5',
    category: 'ai',
    title: 'Revian Receives SaMD Registration for AI Skin Condition Tracking Application',
    source: 'FDA.gov',
    sourceUrl: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm',
    date: '2026-05-02',
    region: '🇺🇸 USA',
    summary: 'Revian이 AI 기반 피부 상태 추적 앱(SaMD)에 대한 FDA 등록을 완료. 적외선 기반 skin tone 분석과 치료 효과 추적 기능이 핵심.',
    fullDetail: 'Revian의 SaMD 등록 세부: 기기 분류 Class II SaMD, 510(k) 번호 K262831. 주요 기능: 적외선+가시광선 복합 분석으로 멜라닌·헤모글로빈 분포 정량화, HIFU/RF/레이저 시술 전후 효과 추적 AI 알고리즘, 의사-환자 공유 대시보드. 구독 모델: 클리닉 당 $299/월.',
    insight: 'SaMD 시장 확장이 의료기기-앱 번들 모델을 가능하게 함. 하드웨어 단독 판매에서 서비스 구독 모델로의 전환 신호.',
    tags: ['SaMD', 'FDA', 'Revian', 'Mobile App', 'Subscription Model'],
    relatedLinks: [
      { label: 'FDA 510(k) K262831 원문', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm' },
      { label: 'Revian 공식 사이트', url: 'https://revian.com' },
      { label: 'FDA SaMD 가이드라인', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd' },
    ],
  },
  {
    id: '6',
    category: 'regulatory',
    title: 'FDA Publishes Draft Guidance on Predetermined Change Control Plans for AI/ML-Based Medical Devices',
    source: 'FDA.gov',
    sourceUrl: 'https://www.fda.gov/medical-devices/digital-health-center-excellence',
    date: '2026-05-01',
    region: '🇺🇸 USA',
    summary: 'FDA가 AI/ML 기반 의료기기의 사전변경관리계획(PCCP) 가이던스 초안을 공개. 알고리즘 업데이트 시 재심사 면제 조건 명확화.',
    fullDetail: '초안 핵심 내용: ① 알고리즘 성능 변화 허용 임계값 명시 (AUC 변동 ±3% 이내 자동 승인), ② 연속 학습 모델(Continuous Learning) 별도 심사 경로 신설, ③ 임상 데이터 드리프트 모니터링 의무화, ④ 의견 수렴 기간: 2026년 7월 31일까지. 최종 가이던스 발효: 2027년 Q1 예상.',
    insight: 'AI 의료기기 후속 업데이트 부담 완화 → 개발사들의 AI 기능 추가 속도 가속화 예상.',
    tags: ['FDA', 'AI/ML', 'PCCP', 'Regulatory', 'Draft Guidance'],
    relatedLinks: [
      { label: 'FDA PCCP 가이던스 초안 원문', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents' },
      { label: 'FDA Digital Health Center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
      { label: '의견 제출 (Regulations.gov)', url: 'https://www.regulations.gov' },
    ],
  },
  {
    id: '7',
    category: 'regulatory',
    title: 'EU MDR Extension Discussion: Class IIa Devices May Get Deadline Relief Until 2027',
    source: 'MedTech Europe',
    sourceUrl: 'https://www.medtecheurope.org',
    date: '2026-04-30',
    region: '🇪🇺 EU',
    summary: 'EU 집행위원회가 Class IIa 의료기기 MDR 전환 기한을 2027년까지 연장하는 방안을 논의 중. 인증기관(Notified Body) 병목 해소를 위한 잠정 조치.',
    fullDetail: '연장안 세부: Class IIa 기기 기존 인증 유효기간 2027년 12월 31일까지 연장, Class IIb/III 기기는 기존 일정 유지. 배경: EU 전체 Notified Body 용량 부족으로 심사 대기 평균 18개월. 의료기기 기업 중 43%가 MDR 인증 미완료 상태 (MedTech Europe 조사). 한국 기업 영향: EU 진출 계획 타임라인 여유 확보 가능.',
    insight: 'EU 진출 타임라인 여유 확보. 반면, 선제적 MDR 인증 완료 기업이 경쟁 우위를 점할 기회.',
    tags: ['EU MDR', 'Class IIa', 'Notified Body', 'Regulation', 'Timeline'],
    relatedLinks: [
      { label: 'MedTech Europe 원문 보고서', url: 'https://www.medtecheurope.org' },
      { label: 'EU MDR 공식 법령', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R0745' },
      { label: 'EUDAMED 진행 현황', url: 'https://ec.europa.eu/tools/eudamed' },
    ],
  },
  {
    id: '8',
    category: 'regulatory',
    title: 'South Korea MFDS Updates Guidance on Clinical Evidence Requirements for Aesthetic Devices',
    source: 'MFDS Korea',
    sourceUrl: 'https://www.mfds.go.kr',
    date: '2026-04-29',
    region: '🇰🇷 Korea',
    summary: '식품의약품안전처가 의료미용기기 임상적 근거 요건 가이던스를 개정. RCT 또는 동등성 시험 자료를 의무화하는 방향으로 기준 강화.',
    fullDetail: '개정 핵심: ① 클래스 II 이상 의료미용기기 허가 시 RCT 또는 동등성 임상 데이터 필수 제출, ② 동등성 인정 범위 축소 (에너지 출력 ±15% → ±10%), ③ 시판 후 조사 기간 연장 (2년 → 3년), ④ 시행일: 2026년 10월 1일. 신규 허가 신청 및 기존 제품 변경허가에 모두 적용.',
    insight: '국내 허가 절차 강화로 신제품 출시 리드타임 증가 예상. 임상 설계 단계부터 규제 요건 반영 필요.',
    tags: ['MFDS', 'Korea', 'Clinical Evidence', 'Aesthetic Devices', '식약처'],
    relatedLinks: [
      { label: '식약처 가이던스 원문', url: 'https://www.mfds.go.kr/brd/m_74/list.do' },
      { label: '식약처 의료기기 허가 안내', url: 'https://www.mfds.go.kr/medicaldevice/index.do' },
      { label: '한국의료기기산업협회', url: 'https://www.kmdia.or.kr' },
    ],
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
  const [detailArticle, setDetailArticle] = useState<Article | null>(null)

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
                  filter === key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[article.category]}`}>
                      {CATEGORY_LABELS[article.category]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Globe className="h-3 w-3" />
                      {article.region}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      {article.source}
                    </a>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                  </div>
                  <button
                    onClick={() => setDetailArticle(article)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <ExternalLink className="h-3 w-3" />
                    상세 링크
                  </button>
                </div>

                <h3 className="mb-2 text-sm font-semibold leading-snug" style={{ color: '#2C3E50' }}>
                  {article.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-600">{article.summary}</p>

                <div className="rounded-xl p-3" style={{ background: 'rgba(0, 45, 116, 0.04)', borderLeft: '3px solid #002D74' }}>
                  <p className="mb-0.5 text-xs font-semibold" style={{ color: '#002D74' }}>비즈니스 시사점</p>
                  <p className="text-xs leading-relaxed text-gray-700">{article.insight}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                      <Tag className="h-2.5 w-2.5 text-gray-400" />
                      {tag}
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
            <h2 className="mb-1 text-sm font-semibold" style={{ color: '#2C3E50' }}>Regulatory Tracker</h2>
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
                      <span
                        className="rounded px-1.5 py-0.5 text-xs font-medium"
                        style={{
                          background: item.region === 'USA' ? '#e3f0fb' : item.region === 'EU' ? '#e8f5e9' : '#fff8e1',
                          color: item.region === 'USA' ? '#0084C9' : item.region === 'EU' ? '#2e7d32' : '#f57f17',
                        }}
                      >
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

      {/* Article Detail Modal */}
      {detailArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailArticle(null) }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-2xl border-b border-gray-100 bg-white p-5 pb-4">
              <div className="flex-1 min-w-0 pr-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[detailArticle.category]}`}>
                    {CATEGORY_LABELS[detailArticle.category]}
                  </span>
                  <span className="text-xs text-gray-400">{detailArticle.region}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{detailArticle.date}</span>
                </div>
                <h2 className="text-base font-bold leading-snug" style={{ color: '#2C3E50' }}>
                  {detailArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailArticle(null)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Source */}
              <div className="flex items-center gap-2 text-sm">
                <Link className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">출처:</span>
                <a
                  href={detailArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {detailArticle.source}
                </a>
              </div>

              {/* Full Summary */}
              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500">요약</h3>
                <p className="text-sm leading-relaxed text-gray-700">{detailArticle.summary}</p>
              </div>

              {/* Full Detail */}
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-500">상세 내용</h3>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{detailArticle.fullDetail}</p>
              </div>

              {/* Business Insight */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(0, 45, 116, 0.05)', borderLeft: '3px solid #002D74' }}>
                <h3 className="mb-1.5 text-xs font-semibold" style={{ color: '#002D74' }}>비즈니스 시사점</h3>
                <p className="text-sm leading-relaxed text-gray-700">{detailArticle.insight}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500">관련 키워드</h3>
                <div className="flex flex-wrap gap-1.5">
                  {detailArticle.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Links */}
              <div>
                <h3 className="mb-2.5 text-xs font-semibold text-gray-500">원본 & 관련 링크</h3>
                <div className="space-y-2">
                  {detailArticle.relatedLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-blue-100">
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-blue-700">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
