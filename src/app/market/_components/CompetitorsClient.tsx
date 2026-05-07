'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Building2, Globe2, Radar, ShieldCheck, Target, TrendingUp } from 'lucide-react'
import MarketNav from './MarketNav'

type Segment = 'hifu-rf' | 'laser' | 'injectables' | 'platform'
type Region = 'korea' | 'global'

type Competitor = {
  name: string
  region: Region
  segment: Segment
  positioning: string
  flagship: string[]
  strengths: string[]
  channels: string[]
  benchmark: {
    portfolioBreadth: number
    premiumPower: number
    globalScale: number
    trainingStrength: number
  }
  sourceLabel: string
  sourceUrl: string
}

const SEGMENT_LABELS: Record<Segment, string> = {
  'hifu-rf': 'HIFU / RF',
  laser: 'Laser / Resurfacing',
  injectables: 'Injectables / Fillers',
  platform: 'Platform / Multi-energy',
}

const REGION_LABELS: Record<'all' | Region, string> = {
  all: 'All',
  korea: 'Korea',
  global: 'Global',
}

const SEGMENT_ACCENT: Record<Segment, string> = {
  'hifu-rf': 'bg-blue-50 text-blue-700',
  laser: 'bg-amber-50 text-amber-700',
  injectables: 'bg-rose-50 text-rose-700',
  platform: 'bg-emerald-50 text-emerald-700',
}

const CLASSYS_PROFILE = {
  company: 'CLASSYS',
  thesis:
    '슈링크 유니버스와 볼뉴머를 중심으로 리프팅과 스킨 타이트닝에 강한 브랜드 파워를 확보했고, 교육형 세일즈와 글로벌 유통 확장 속도가 빠른 편입니다.',
  watchpoints: [
    '국내 리프팅 장비군은 HIFU, 모노폴라 RF, 마이크로니들 RF가 서로 대체재로 움직입니다.',
    '글로벌 비교군은 장비 단품보다 시술 프로토콜, KOL 교육, 소모품 매출 구조까지 함께 봐야 합니다.',
    '국내사는 가격 민첩성과 속도, 글로벌사는 브랜드 프리미엄과 트레이닝 체계가 강점입니다.',
  ],
}

const COMPETITORS: Competitor[] = [
  {
    name: 'Merz Aesthetics',
    region: 'global',
    segment: 'injectables',
    positioning: 'Ultherapy와 Xeomin을 보유한 프리미엄 에스테틱 플랫폼',
    flagship: ['Ultherapy PRIME', 'Xeomin', 'Belotero'],
    strengths: ['의사 교육 프로그램', '프리미엄 시술 포지셔닝', '글로벌 파트너십'],
    channels: ['KOL academy', 'provider marketing', 'global congress'],
    benchmark: { portfolioBreadth: 88, premiumPower: 95, globalScale: 92, trainingStrength: 93 },
    sourceLabel: 'Merz Aesthetics',
    sourceUrl: 'https://www.merz-aesthetics.com/',
  },
  {
    name: 'Solta Medical',
    region: 'global',
    segment: 'platform',
    positioning: 'Thermage, Fraxel, Clear + Brilliant 중심의 에너지 디바이스 플랫폼',
    flagship: ['Thermage FLX', 'Fraxel', 'Clear + Brilliant'],
    strengths: ['브랜드 인지도', '적응증 다양성', '미국 중심의 강한 공급자 네트워크'],
    channels: ['clinical education', 'provider events', 'campaign co-marketing'],
    benchmark: { portfolioBreadth: 90, premiumPower: 92, globalScale: 90, trainingStrength: 87 },
    sourceLabel: 'Solta Medical',
    sourceUrl: 'https://www.soltamedical.com/',
  },
  {
    name: 'Lutronic',
    region: 'korea',
    segment: 'laser',
    positioning: '레이저와 에너지 기반의 폭넓은 장비 포트폴리오',
    flagship: ['Genius RF', 'ULTRA', 'Clarity II'],
    strengths: ['레이저 전문성', 'R&D 투자', '북미 유통 기반'],
    channels: ['clinical articles', 'KOL network', 'provider training'],
    benchmark: { portfolioBreadth: 86, premiumPower: 79, globalScale: 82, trainingStrength: 84 },
    sourceLabel: 'Lutronic',
    sourceUrl: 'https://www.lutronic.com/us/about-us/',
  },
  {
    name: 'Jeisys Medical',
    region: 'korea',
    segment: 'hifu-rf',
    positioning: 'Density, LinearZ, Potenza를 앞세운 리프팅 집중 플레이어',
    flagship: ['DENSITY', 'LinearZ', 'POTENZA'],
    strengths: ['리프팅 중심 라인업', '아시아 확장', '클리닉 맞춤형 포트폴리오'],
    channels: ['launch roadshow', 'academy event', 'distributor expansion'],
    benchmark: { portfolioBreadth: 78, premiumPower: 76, globalScale: 74, trainingStrength: 77 },
    sourceLabel: 'Jeisys',
    sourceUrl: 'https://www.jeisys.com/eng/',
  },
  {
    name: 'WONTECH',
    region: 'korea',
    segment: 'laser',
    positioning: '피코 및 레이저 기반 색소·리서페이싱 중심 포트폴리오',
    flagship: ['PICOCARE', 'TONURI', 'XERF'],
    strengths: ['색소/레이저 강점', '중동 및 아시아 확장', '가격 경쟁력'],
    channels: ['distributor channel', 'regional congress', 'dealer training'],
    benchmark: { portfolioBreadth: 74, premiumPower: 69, globalScale: 70, trainingStrength: 68 },
    sourceLabel: 'WONTECH',
    sourceUrl: 'https://wontech.co.kr/en/',
  },
  {
    name: 'TENTEC',
    region: 'korea',
    segment: 'hifu-rf',
    positioning: '텐써마 중심의 모노폴라 RF 특화 브랜드',
    flagship: ['10THERMA'],
    strengths: ['단일 히어로 제품', '빠른 세일즈 메시지', '국내외 대리점 전개'],
    channels: ['demo session', 'before/after marketing', 'regional distributor'],
    benchmark: { portfolioBreadth: 55, premiumPower: 67, globalScale: 58, trainingStrength: 61 },
    sourceLabel: 'TENTEC',
    sourceUrl: 'https://www.tenteckorea.com/',
  },
  {
    name: 'ASTERASYS',
    region: 'korea',
    segment: 'platform',
    positioning: '쿨페이즈와 복합 에너지 솔루션을 내세우는 성장형 업체',
    flagship: ['COOLFAZE', 'DENSITY-style energy systems'],
    strengths: ['신제품 민첩성', '복합 시술 제안', '유통 파트너 대응 속도'],
    channels: ['global partner sales', 'trade shows', 'doctor workshop'],
    benchmark: { portfolioBreadth: 58, premiumPower: 60, globalScale: 52, trainingStrength: 57 },
    sourceLabel: 'ASTERASYS',
    sourceUrl: 'https://www.asterasys.com/',
  },
  {
    name: 'Cynosure',
    region: 'global',
    segment: 'platform',
    positioning: '바디, 레이저, RF를 아우르는 멀티 카테고리 플레이어',
    flagship: ['Potenza', 'Elite iQ', 'PicoSure'],
    strengths: ['글로벌 세일즈 네트워크', '포트폴리오 다양성', '브랜드 잔존 인지도'],
    channels: ['trade marketing', 'clinical education', 'provider growth programs'],
    benchmark: { portfolioBreadth: 89, premiumPower: 83, globalScale: 88, trainingStrength: 82 },
    sourceLabel: 'Cynosure',
    sourceUrl: 'https://cynosurelutronic.com/',
  },
  {
    name: 'Candela',
    region: 'global',
    segment: 'laser',
    positioning: '레이저·에너지 장비의 전통 강자',
    flagship: ['GentleMax Pro Plus', 'Profound Matrix', 'Nordlys'],
    strengths: ['브랜드 역사', '다적응증 레이저', '북미·유럽 침투도'],
    channels: ['clinical symposium', 'KOL webinar', 'provider acquisition'],
    benchmark: { portfolioBreadth: 87, premiumPower: 88, globalScale: 90, trainingStrength: 85 },
    sourceLabel: 'Candela Medical',
    sourceUrl: 'https://candelamedical.com/',
  },
  {
    name: 'InMode',
    region: 'global',
    segment: 'platform',
    positioning: 'RF 기반 바디·페이스 시술 장비에 강한 성장형 플랫폼',
    flagship: ['Morpheus8', 'Forma', 'BodyTite'],
    strengths: ['공격적 마케팅', '시술명 브랜딩', '미국 소비자 인지도'],
    channels: ['social amplification', 'provider bundles', 'consumer-led demand'],
    benchmark: { portfolioBreadth: 85, premiumPower: 84, globalScale: 86, trainingStrength: 79 },
    sourceLabel: 'InMode',
    sourceUrl: 'https://inmodemd.com/',
  },
]

export default function CompetitorsClient() {
  const [region, setRegion] = useState<'all' | Region>('all')
  const [segment, setSegment] = useState<'all' | Segment>('all')

  const filtered = useMemo(() => {
    return COMPETITORS.filter((company) => {
      const regionMatch = region === 'all' || company.region === region
      const segmentMatch = segment === 'all' || company.segment === segment
      return regionMatch && segmentMatch
    })
  }, [region, segment])

  const domesticSet = filtered.filter((item) => item.region === 'korea')
  const globalSet = filtered.filter((item) => item.region === 'global')

  const leaders = useMemo(() => {
    return [...filtered]
      .sort((a, b) => {
        const aTotal =
          a.benchmark.portfolioBreadth + a.benchmark.premiumPower + a.benchmark.globalScale + a.benchmark.trainingStrength
        const bTotal =
          b.benchmark.portfolioBreadth + b.benchmark.premiumPower + b.benchmark.globalScale + b.benchmark.trainingStrength
        return bTotal - aTotal
      })
      .slice(0, 5)
  }, [filtered])

  return (
    <div className="min-h-full bg-[#f7f8fb]">
      <MarketNav />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Market / Competitors</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">CLASSYS Competitive Benchmark</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{CLASSYS_PROFILE.thesis}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FilterGroup<'all' | Region>
                label="Region"
                value={region}
                options={['all', 'korea', 'global']}
                labels={REGION_LABELS}
                onChange={setRegion}
              />
              <FilterGroup<'all' | Segment>
                label="Segment"
                value={segment}
                options={['all', 'hifu-rf', 'laser', 'injectables', 'platform']}
                labels={{ all: 'All', ...SEGMENT_LABELS }}
                onChange={setSegment}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Target className="h-4 w-4" />
                CLASSYS interpretation
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {CLASSYS_PROFILE.watchpoints.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Filtered players" value={String(filtered.length)} icon={<Building2 className="h-4 w-4" />} />
              <MetricCard label="Domestic required set" value={String(domesticSet.length)} icon={<ShieldCheck className="h-4 w-4" />} />
              <MetricCard label="Global peer set" value={String(globalSet.length)} icon={<Globe2 className="h-4 w-4" />} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-950">Top benchmark group</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">포트폴리오, 프리미엄 파워, 글로벌 스케일, 교육 경쟁력을 합산한 상대 비교입니다.</p>
            <div className="mt-5 space-y-3">
              {leaders.map((company, index) => {
                const total =
                  company.benchmark.portfolioBreadth +
                  company.benchmark.premiumPower +
                  company.benchmark.globalScale +
                  company.benchmark.trainingStrength
                return (
                  <div key={company.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <p className="font-semibold text-slate-900">{company.name}</p>
                          <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', SEGMENT_ACCENT[company.segment]].join(' ')}>
                            {SEGMENT_LABELS[company.segment]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{company.positioning}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Composite</p>
                        <p className="text-2xl font-bold text-blue-700">{total}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <ScoreBar label="Portfolio" value={company.benchmark.portfolioBreadth} />
                      <ScoreBar label="Premium" value={company.benchmark.premiumPower} />
                      <ScoreBar label="Global scale" value={company.benchmark.globalScale} />
                      <ScoreBar label="Training" value={company.benchmark.trainingStrength} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-950">Actionable reading for market team</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InsightCard
                title="Domestic pressure"
                body="국내는 제이시스, 원텍, 텐텍이 시술 카테고리 안에서 빠른 메시지 전환을 합니다. 가격과 데모 속도 경쟁이 강합니다."
              />
              <InsightCard
                title="Global benchmark"
                body="Merz와 Solta는 장비 성능 자체보다 교육 프로그램과 브랜드 신뢰가 강점입니다. CLASSYS도 학술형 트레이닝 자산을 더 전면화할 필요가 있습니다."
              />
              <InsightCard
                title="Commercial leverage"
                body="국내 HIFU와 RF는 장비 단품 비교보다 소모품 구조, 업그레이드 패키지, 유지율 지표가 실질적인 차별점이 됩니다."
              />
              <InsightCard
                title="Portfolio gap"
                body="레이저 카테고리는 Lutronic, WONTECH, Candela가 강하므로 CLASSYS는 리프팅 집중 포지셔닝을 유지하되 복합 시술 시나리오 제안이 중요합니다."
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-950">Competitor cards</h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((company) => (
              <article key={company.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-950">{company.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {REGION_LABELS[company.region]}
                      </span>
                      <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', SEGMENT_ACCENT[company.segment]].join(' ')}>
                        {SEGMENT_LABELS[company.segment]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{company.positioning}</p>
                  </div>

                  <a
                    href={company.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Source: {company.sourceLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <ListBlock title="Flagship" items={company.flagship} />
                  <ListBlock title="Strengths" items={company.strengths} />
                  <ListBlock title="Go-to-market" items={company.channels} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MiniScore label="Portfolio" value={company.benchmark.portfolioBreadth} />
                  <MiniScore label="Premium" value={company.benchmark.premiumPower} />
                  <MiniScore label="Global" value={company.benchmark.globalScale} />
                  <MiniScore label="Training" value={company.benchmark.trainingStrength} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  labels: Record<T, string>
  onChange: (next: T) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={[
              'rounded-full px-3 py-2 text-sm font-medium transition-colors',
              value === option ? 'bg-[#002D74] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {labels[option]}
          </button>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="rounded-full bg-slate-100 p-2 text-slate-700">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-[#002D74]" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
