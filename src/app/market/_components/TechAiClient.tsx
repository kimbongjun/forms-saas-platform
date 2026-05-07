'use client'

import { useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  ExternalLink,
  Globe,
  Link,
  RefreshCw,
  Tag,
  X,
  Zap,
} from 'lucide-react'
import MarketNav from './MarketNav'

type FilterKey = 'all' | 'tech' | 'ai' | 'regulatory'

type Article = {
  id: string
  category: Exclude<FilterKey, 'all'>
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
    id: 'hifu-imaging',
    category: 'tech',
    title: 'Real-time imaging is becoming a premium story in next-generation HIFU positioning',
    source: 'Lasers in Surgery and Medicine',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/10969101',
    date: '2026-05-05',
    region: 'Global',
    summary: '실시간 이미징과 시술 가시성을 결합한 HIFU 메시지가 프리미엄 카테고리에서 빠르게 확산되고 있습니다.',
    fullDetail:
      '장비 성능 자체보다 시술 과정의 가시성과 안전감을 강조하는 메시지가 늘고 있습니다. 환자 상담 단계에서 이해하기 쉬운 시각 자료를 제공하고, 시술자 입장에서는 레이어 타기팅 정확성을 전면에 내세우는 흐름입니다.',
    insight: 'CLASSYS도 리프팅 성능 설명과 함께 시술 경험, 해석 가능성, 상담 자료 구조를 묶어 프리미엄 포지셔닝을 강화할 수 있습니다.',
    tags: ['HIFU', 'Imaging', 'Premium', 'Clinical workflow'],
    relatedLinks: [
      { label: 'Journal homepage', url: 'https://onlinelibrary.wiley.com/journal/10969101' },
      { label: 'PubMed search', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=HIFU+imaging+aesthetic' },
    ],
  },
  {
    id: 'rf-combo',
    category: 'tech',
    title: 'RF platforms are increasingly sold as combination-treatment engines rather than single devices',
    source: 'InMode',
    sourceUrl: 'https://inmodemd.com/',
    date: '2026-05-04',
    region: 'USA',
    summary: 'RF는 단품 비교보다 바디, 페이스, 업셀링 프로토콜까지 포함한 플랫폼 메시지로 판매되는 경향이 강합니다.',
    fullDetail:
      '시장 커뮤니케이션은 에너지 출력보다 패키지 시술 경험, 카트리지 체계, 운영 수익 구조를 중심으로 바뀌고 있습니다. 병원은 제품 하나보다 반복 매출 구조와 확장 가능한 시술 메뉴를 같이 평가합니다.',
    insight: 'CLASSYS의 경쟁 해석도 제품 스펙표 비교에 머물지 말고, 소모품 구조와 시술 번들 설계까지 확장할 필요가 있습니다.',
    tags: ['RF', 'Platform', 'Commercial model', 'Upsell'],
    relatedLinks: [
      { label: 'InMode corporate site', url: 'https://inmodemd.com/' },
      { label: 'Solta Medical overview', url: 'https://www.soltamedical.com/' },
    ],
  },
  {
    id: 'skin-analysis',
    category: 'ai',
    title: 'AI skin analysis is moving from novelty to workflow support',
    source: 'Canfield Scientific',
    sourceUrl: 'https://www.canfieldsci.com/news',
    date: '2026-05-05',
    region: 'USA',
    summary: 'AI 분석은 독립 제품보다 상담, 추적 관찰, before/after 해석을 보조하는 워크플로우 도구로 자리 잡는 중입니다.',
    fullDetail:
      '피부 상태 분류, 사진 정렬, 결과 비교 리포트 생성 등 반복적인 실무를 줄이는 보조 기능이 핵심 가치로 보입니다. 병원 입장에서는 장비 도입보다 상담 효율과 전환율 개선이 직접적인 구매 동기가 됩니다.',
    insight: 'AI는 시장에서 하드웨어의 보조 가치로 해석되는 비중이 크므로, 장비 판매와 연결되는 운영 툴 관점에서 봐야 합니다.',
    tags: ['AI', 'Skin analysis', 'Workflow', 'Consultation'],
    relatedLinks: [
      { label: 'Canfield news', url: 'https://www.canfieldsci.com/news' },
      { label: 'FDA digital health center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
    ],
  },
  {
    id: 'samd-subscription',
    category: 'ai',
    title: 'SaMD value is increasingly framed as subscription support around a device business',
    source: 'FDA Digital Health',
    sourceUrl: 'https://www.fda.gov/medical-devices/digital-health-center-excellence',
    date: '2026-05-02',
    region: 'USA',
    summary: '소프트웨어 기능은 단독 매출보다 하드웨어 유지, 결과 추적, 리포팅 구독과 연결될 때 상업성이 커집니다.',
    fullDetail:
      'SaMD는 단순 승인 여부보다 업데이트 관리, 데이터 보관, 병원 내 반복 사용성, 영업 스토리 결합이 핵심입니다. 실제 시장에서는 상담 도구와 임상 결과 추적 기능이 더 자주 언급됩니다.',
    insight: '시장조사 관점에서는 AI 기능이 독립 사업인지, 장비 판매 보조인지 구분해서 보는 것이 중요합니다.',
    tags: ['SaMD', 'Subscription', 'AI', 'Software layer'],
    relatedLinks: [
      { label: 'FDA SaMD overview', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd' },
      { label: 'Digital health center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
    ],
  },
  {
    id: 'fda-ai-guidance',
    category: 'regulatory',
    title: 'AI/ML change control expectations are becoming a key product planning issue',
    source: 'FDA',
    sourceUrl: 'https://www.fda.gov/medical-devices/digital-health-center-excellence',
    date: '2026-05-01',
    region: 'USA',
    summary: 'AI 기능은 단순 추가보다 업데이트 계획, 설명 책임, 사후 관리 설계까지 같이 요구되는 방향입니다.',
    fullDetail:
      '제품 기획 단계에서 성능 개선 로직을 어떻게 관리할지, 어떤 범위의 자동 업데이트가 허용될지를 미리 설계해야 합니다. 규제는 모델 변경 관리와 검증 체계를 점점 더 구체적으로 요구합니다.',
    insight: 'AI 기능은 출시 이후의 운영 시나리오까지 포함해서 계획하지 않으면 시장 진입 속도가 늦어질 수 있습니다.',
    tags: ['FDA', 'AI/ML', 'Guidance', 'Regulatory'],
    relatedLinks: [
      { label: 'FDA guidance search', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents' },
      { label: 'Digital health center', url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence' },
    ],
  },
  {
    id: 'eu-mdr-timeline',
    category: 'regulatory',
    title: 'EU MDR timing still affects launch sequencing for many mid-tier device companies',
    source: 'MedTech Europe',
    sourceUrl: 'https://www.medtecheurope.org/',
    date: '2026-04-30',
    region: 'Europe',
    summary: '유럽 인증 일정과 인증기관 병목은 여전히 제품 출시 순서와 파트너 대응 속도에 영향을 줍니다.',
    fullDetail:
      '유럽 진출은 제품력만이 아니라 문서 준비, 인증기관 일정, 현지 파트너 커뮤니케이션 리듬이 함께 맞아야 합니다. 경쟁사 출시 시점 해석에서도 이 요소를 빼면 실제 판단이 틀어질 수 있습니다.',
    insight: '시장조사 화면에서도 유럽 경쟁사 소식은 제품 발표일보다 실제 판매 개시 시점과 인증 문맥을 같이 봐야 합니다.',
    tags: ['EU MDR', 'Launch timing', 'Certification', 'Europe'],
    relatedLinks: [
      { label: 'MedTech Europe', url: 'https://www.medtecheurope.org/' },
      { label: 'EU medical devices sector', url: 'https://health.ec.europa.eu/medical-devices-sector_en' },
    ],
  },
]

const REGULATORY_UPDATES = [
  { device: 'AI imaging support module', type: 'FDA planning', status: 'pending', date: '2026-05-04', region: 'USA' },
  { device: 'Next-gen HIFU workflow pack', type: 'CE planning', status: 'pending', date: '2026-05-03', region: 'EU' },
  { device: 'SaMD reporting layer', type: 'Registration complete', status: 'approved', date: '2026-05-02', region: 'USA' },
  { device: 'CLASSYS China submission watch', type: 'NMPA tracking', status: 'pending', date: '2026-04-28', region: 'China' },
  { device: 'Laser category expansion', type: 'CE approval', status: 'approved', date: '2026-04-25', region: 'EU' },
]

const CATEGORY_LABELS: Record<FilterKey, string> = {
  all: 'All',
  tech: 'Technology',
  ai: 'AI / SaMD',
  regulatory: 'Regulatory',
}

const CATEGORY_COLORS: Record<Article['category'], string> = {
  tech: 'bg-blue-100 text-blue-700',
  ai: 'bg-violet-100 text-violet-700',
  regulatory: 'bg-amber-100 text-amber-700',
}

export default function TechAiClient() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('2026-05-07 09:10')
  const [detailArticle, setDetailArticle] = useState<Article | null>(null)

  const filtered = filter === 'all' ? ARTICLES : ARTICLES.filter((article) => article.category === filter)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const now = new Date()
    setLastUpdated(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
    setRefreshing(false)
  }

  return (
    <div className="min-h-full bg-white">
      <MarketNav />

      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Market / Tech & AI</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">Tech & AI Watch</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                기술 변화, AI 보조 기능, 규제 흐름을 제품 기획과 영업 관점에서 함께 해석하는 화면입니다.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap gap-2">
            {(['all', 'tech', 'ai', 'regulatory'] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  filter === key ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {key === 'tech' ? <Cpu className="h-3.5 w-3.5" /> : null}
                {key === 'ai' ? <Zap className="h-3.5 w-3.5" /> : null}
                {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((article) => (
              <article key={article.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', CATEGORY_COLORS[article.category]].join(' ')}>
                      {CATEGORY_LABELS[article.category]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Globe className="h-3 w-3" />
                      {article.region}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                      {article.source}
                    </a>
                  </div>
                  <button
                    onClick={() => setDetailArticle(article)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Detail
                  </button>
                </div>

                <h2 className="text-base font-bold leading-snug text-slate-950">{article.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{article.summary}</p>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Business interpretation</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{article.insight}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="sticky top-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Regulatory tracker</h2>
            <p className="mt-1 text-xs text-slate-400">Recent approval and planning signals</p>
            <div className="mt-4 space-y-3">
              {REGULATORY_UPDATES.map((item) => (
                <div key={`${item.device}-${item.date}`} className="flex items-start gap-3">
                  {item.status === 'approved' ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-slate-800">{item.device}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{item.type}</span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{item.region}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {detailArticle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setDetailArticle(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', CATEGORY_COLORS[detailArticle.category]].join(' ')}>
                      {CATEGORY_LABELS[detailArticle.category]}
                    </span>
                    <span className="text-xs text-slate-400">{detailArticle.region}</span>
                    <span className="text-xs text-slate-400">{detailArticle.date}</span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-slate-950">{detailArticle.title}</h2>
                </div>
                <button onClick={() => setDetailArticle(null)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Link className="h-4 w-4" />
                <span>Source:</span>
                <a href={detailArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">
                  {detailArticle.source}
                </a>
              </div>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{detailArticle.summary}</p>
              </section>

              <section className="rounded-2xl bg-slate-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detail</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{detailArticle.fullDetail}</p>
              </section>

              <section className="rounded-2xl bg-blue-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700">Business interpretation</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-950">{detailArticle.insight}</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailArticle.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Related links</h3>
                <div className="mt-2 space-y-2">
                  {detailArticle.relatedLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">{link.label}</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
