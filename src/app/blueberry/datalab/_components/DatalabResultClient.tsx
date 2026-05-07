'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Download, Info, RefreshCw } from 'lucide-react'

interface DatalabPayload {
  groups: { groupName: string; keywords: string[] }[]
  startDate: string
  endDate: string
  timeUnit: 'date' | 'week' | 'month'
  device: string
  gender: string
  ages: string[]
  periodLabel: string
  deviceLabel: string
  genderLabel: string
  ageLabel: string
}

interface DatalabDataPoint {
  period: string
  ratio: number
}

interface DatalabResultItem {
  title: string
  keywords: string[]
  data: DatalabDataPoint[]
}

interface DatalabResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: DatalabResultItem[]
  error?: string
  detail?: string
  status?: number
}

interface ApiError {
  message: string
  detail?: string
  status?: number
}

const COLORS = ['#002D74', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4']

function decodePayload(value: string) {
  const standard = value.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(decodeURIComponent(escape(atob(standard)))) as DatalabPayload
}

function TrendChart({ results }: { results: DatalabResultItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    period: string
    values: { title: string; ratio: number; color: string }[]
  } | null>(null)

  if (results.length === 0 || results[0].data.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-4 py-16 text-center text-sm text-gray-400">
        차트로 표시할 데이터가 없습니다.
      </div>
    )
  }

  const width = 760
  const height = 300
  const padding = { top: 18, right: 20, bottom: 34, left: 42 }
  const labels = results[0].data.map((item) => item.period)
  const allValues = results.flatMap((result) => result.data.map((item) => item.ratio))
  const maxValue = Math.max(...allValues, 1)

  const getX = (index: number) =>
    padding.left + (index / Math.max(labels.length - 1, 1)) * (width - padding.left - padding.right)
  const getY = (value: number) => padding.top + (1 - value / maxValue) * (height - padding.top - padding.bottom)

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    const bounds = svgRef.current?.getBoundingClientRect()
    if (!bounds) return

    const relativeX = (event.clientX - bounds.left) * (width / bounds.width)
    const index = Math.min(
      labels.length - 1,
      Math.max(0, Math.round((relativeX - padding.left) / ((width - padding.left - padding.right) / Math.max(labels.length - 1, 1)))),
    )

    setHoveredIndex(index)
    setTooltip({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      period: labels[index],
      values: results.map((result, resultIndex) => ({
        title: result.title,
        ratio: result.data[index]?.ratio ?? 0,
        color: COLORS[resultIndex % COLORS.length],
      })),
    })
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredIndex(null)
          setTooltip(null)
        }}
      >
        <defs>
          {results.map((_, index) => (
            <linearGradient key={index} id={`datalab-gradient-${index}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity="0.18" />
              <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(tick)}
              y2={getY(tick)}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text x={padding.left - 8} y={getY(tick)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#9CA3AF">
              {tick}
            </text>
          </g>
        ))}

        {hoveredIndex !== null ? (
          <line
            x1={getX(hoveredIndex)}
            x2={getX(hoveredIndex)}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        ) : null}

        {results.map((result, index) => {
          const color = COLORS[index % COLORS.length]
          const points = result.data.map((item, pointIndex) => ({ x: getX(pointIndex), y: getY(item.ratio) }))
          const linePath = points.map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
          const areaPath = `${linePath} L ${points.at(-1)?.x ?? padding.left} ${height - padding.bottom} L ${
            points[0]?.x ?? padding.left
          } ${height - padding.bottom} Z`

          return (
            <g key={result.title}>
              <path d={areaPath} fill={`url(#datalab-gradient-${index})`} />
              <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((point, pointIndex) => (
                <circle key={`${result.title}-${pointIndex}`} cx={point.x} cy={point.y} r={hoveredIndex === pointIndex ? 4.5 : 3} fill={color} />
              ))}
            </g>
          )
        })}
      </svg>

      {tooltip ? (
        <div
          className="pointer-events-none absolute z-10 rounded-2xl border border-gray-200 bg-white p-3 text-xs shadow-xl"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            transform: tooltip.x > 520 ? 'translateX(-110%)' : undefined,
          }}
        >
          <p className="mb-2 font-semibold text-gray-700">{tooltip.period}</p>
          <div className="space-y-1.5">
            {tooltip.values.map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-500">{item.title}</span>
                <span className="ml-auto font-semibold text-gray-900">{item.ratio.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex justify-between gap-2 overflow-hidden text-[11px] text-gray-400">
        {labels.filter((_, index) => {
          const step = Math.max(1, Math.ceil(labels.length / 7))
          return index % step === 0 || index === labels.length - 1
        }).map((label) => (
          <span key={label} className="truncate">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DatalabResultClient() {
  const params = useSearchParams()
  const router = useRouter()
  const [payload, setPayload] = useState<DatalabPayload | null>(null)
  const [result, setResult] = useState<DatalabResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const query = params.get('q')
    if (!query) {
      setError({ message: '분석 파라미터가 없습니다.' })
      return
    }

    try {
      setPayload(decodePayload(query))
    } catch {
      setError({ message: '분석 파라미터를 해석하지 못했습니다.' })
    }
  }, [params])

  useEffect(() => {
    if (!payload) return
    void fetchResult(payload)
  }, [payload])

  async function fetchResult(nextPayload: DatalabPayload) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blueberry/datalab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: nextPayload.startDate,
          endDate: nextPayload.endDate,
          timeUnit: nextPayload.timeUnit,
          keywordGroups: nextPayload.groups,
          device: nextPayload.device || undefined,
          gender: nextPayload.gender || undefined,
          ages: nextPayload.ages.length > 0 ? nextPayload.ages : undefined,
        }),
      })

      const data = (await response.json()) as DatalabResponse
      if (!response.ok || data.error) {
        setError({
          message: data.error ?? 'DataLab 결과를 불러오지 못했습니다.',
          detail: data.detail,
          status: data.status,
        })
        setResult(null)
        return
      }

      setResult(data)
    } catch (fetchError) {
      setError({ message: fetchError instanceof Error ? fetchError.message : 'DataLab 호출에 실패했습니다.' })
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const rowCount = result?.results[0]?.data.length ?? 0
  const summaryCards = useMemo(() => {
    if (!payload) return []
    return [
      { label: '기간', value: payload.periodLabel, helper: `${payload.startDate} ~ ${payload.endDate}` },
      { label: '디바이스', value: payload.deviceLabel, helper: '검색 디바이스 조건' },
      { label: '성별', value: payload.genderLabel, helper: '검색 성별 조건' },
      { label: '연령', value: payload.ageLabel, helper: '검색 연령 조건' },
    ]
  }, [payload])

  function exportCsv() {
    if (!result) return
    const rows: string[] = []
    rows.push(['period', ...result.results.map((item) => item.title)].join(','))

    for (let index = 0; index < rowCount; index += 1) {
      rows.push([
        result.results[0].data[index].period,
        ...result.results.map((item) => String(item.data[index]?.ratio ?? '')),
      ].join(','))
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `blueberry_datalab_${result.startDate}_${result.endDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!payload && !error) {
    return (
      <div className="flex items-center justify-center py-32 text-sm text-gray-400">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        분석 조건을 불러오는 중입니다.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/blueberry')}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              블루베리로 돌아가기
            </button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">Naver DataLab 비교 결과</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              주제 그룹별 검색 추이를 비교하고, 기간과 조건 필터가 결과에 어떤 영향을 주는지 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => payload && fetchResult(payload)}
              disabled={loading || !payload}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#002D74] hover:text-[#002D74] disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <RefreshCw className={['h-4 w-4', loading ? 'animate-spin' : ''].join(' ')} />
              새로고침
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!result}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#002D74] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A4AA8] disabled:cursor-not-allowed disabled:bg-[#9FB5DD]"
            >
              <Download className="h-4 w-4" />
              CSV 다운로드
            </button>
          </div>
        </div>
      </section>

      {payload ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{card.value}</p>
              <p className="mt-2 text-sm text-gray-500">{card.helper}</p>
            </div>
          ))}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[30px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 text-rose-600" />
            <div>
              <h2 className="text-base font-semibold text-rose-700">DataLab 호출 오류</h2>
              <p className="mt-2 text-sm text-rose-700">{error.message}</p>
              {error.status ? <p className="mt-1 text-xs text-rose-600">HTTP Status: {error.status}</p> : null}
              {error.detail ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-white/80 p-3 text-xs text-rose-700">{error.detail}</pre>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">검색 추이 차트</h2>
            <p className="text-sm text-gray-500">그룹별 검색 비율을 동일한 축에서 비교합니다.</p>
          </div>
        </div>

        {loading && !result ? (
          <div className="h-72 animate-pulse rounded-3xl bg-gray-100" />
        ) : result ? (
          <TrendChart results={result.results} />
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-4 py-16 text-center text-sm text-gray-400">
            결과를 불러오지 못했습니다.
          </div>
        )}
      </section>

      {result ? (
        <section className="rounded-[30px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">그룹 상세</h2>
            <p className="text-sm text-gray-500">각 그룹에 포함된 키워드와 최신 검색 비율을 함께 확인할 수 있습니다.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.results.map((item, index) => {
              const latest = item.data.at(-1)?.ratio ?? 0
              const previous = item.data.length > 1 ? item.data.at(-2)?.ratio ?? latest : latest
              const delta = latest - previous
              return (
                <div key={item.title} className="rounded-3xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{item.keywords.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Latest</p>
                      <p className="mt-1 text-xl font-semibold text-gray-900">{latest.toFixed(2)}</p>
                      <p className={['mt-1 text-xs font-medium', delta >= 0 ? 'text-emerald-600' : 'text-rose-600'].join(' ')}>
                        {delta >= 0 ? '+' : ''}
                        {delta.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
