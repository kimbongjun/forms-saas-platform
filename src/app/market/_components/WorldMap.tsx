'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'

// world-atlas 데이터 타입
type WorldTopology = Topology<{
  countries: GeometryCollection<{ name?: string }>
  land: GeometryCollection
}>

// 대륙별 국가 코드 (ISO numeric)
const CONTINENT_MAP: Record<string, number[]> = {
  Asia: [156, 392, 410, 356, 764, 704, 360, 398, 400, 144, 51, 50, 104, 496, 458, 608, 682, 792, 784, 760, 422, 368, 364],
  Europe: [276, 250, 380, 724, 826, 752, 578, 208, 246, 40, 56, 620, 528, 300, 191, 100, 348, 703, 756, 112, 804, 498, 688],
  Americas: [840, 76, 484, 32, 152, 170, 604, 862, 858, 600, 591, 188, 320, 340, 332, 214, 388, 630, 192, 780, 308],
  Africa: [24, 12, 818, 404, 710, 566, 716, 288, 516, 72, 887, 729],
  Oceania: [36, 554, 598, 242, 90],
}

const CONTINENT_COLORS: Record<string, string> = {
  Asia: '#0084C9',
  Europe: '#48BB78',
  Americas: '#FF6B35',
  Africa: '#D69E2E',
  Oceania: '#9F7AEA',
  Default: '#CBD5E0',
}

const CONTINENT_LABELS: Array<{ name: string; lat: number; lon: number }> = [
  { name: 'Asia', lat: 40, lon: 95 },
  { name: 'Europe', lat: 54, lon: 15 },
  { name: 'Americas', lat: 10, lon: -80 },
  { name: 'Africa', lat: 5, lon: 22 },
  { name: 'Oceania', lat: -25, lon: 140 },
]

interface MarketData {
  name: string
  nameKo: string
  lat: number
  lon: number
  marketSize: string
  growth: string
  brands: string
  classys: string
  trend: string
}

const MARKET_DATA: MarketData[] = [
  { name: 'Korea', nameKo: '한국', lat: 37.5, lon: 127.0, marketSize: '$2.1B', growth: '+18.4%', brands: '클래시스/원텍/아스테라시스', classys: '자국 1위', trend: 'HIFU/RF 리프팅 강세' },
  { name: 'Japan', nameKo: '일본', lat: 36.2, lon: 138.3, marketSize: '$1.8B', growth: '+9.2%', brands: '알마레이저/시네론메디칼', classys: '현지 파트너 통한 유통', trend: '비침습 안티에이징' },
  { name: 'China', nameKo: '중국', lat: 35.9, lon: 104.2, marketSize: '$3.2B', growth: '+22.1%', brands: '하이마루/이노비오/Fotona', classys: 'NMPA 취득 완료', trend: '국산화 정책 속 프리미엄 수입기기 성장' },
  { name: 'USA', nameKo: '미국', lat: 37.8, lon: -96.9, marketSize: '$5.3B', growth: '+8.3%', brands: 'InMode/Cutera/Candela', classys: 'FDA 510(k) 인허가 추진중', trend: 'Body Contouring / 남성 시술 증가' },
  { name: 'Germany', nameKo: '독일', lat: 51.2, lon: 10.5, marketSize: '$0.9B', growth: '+6.8%', brands: 'Merz/Schiller', classys: '유럽 본부 거점', trend: 'CE MDR 인증 강화' },
  { name: 'France', nameKo: '프랑스', lat: 46.2, lon: 2.2, marketSize: '$0.7B', growth: '+5.9%', brands: 'Allergan/Ipsen', classys: '파트너십 협의중', trend: '럭셔리 에스테틱 시장' },
  { name: 'Brazil', nameKo: '브라질', lat: -14.2, lon: -51.9, marketSize: '$1.2B', growth: '+14.2%', brands: 'Ibramed/HTM', classys: '라틴아메리카 거점', trend: 'Body Contouring 선호' },
  { name: 'India', nameKo: '인도', lat: 20.6, lon: 78.9, marketSize: '$0.6B', growth: '+21.3%', brands: 'Alma/Syneron', classys: '인도 파트너 교육 프로그램 강화', trend: '급성장하는 메디스파 시장' },
  { name: 'Thailand', nameKo: '태국', lat: 15.9, lon: 100.9, marketSize: '$0.8B', growth: '+19.4%', brands: '현지 유통망', classys: '동남아 교육센터 방콕', trend: 'Medical Tourism 허브' },
  { name: 'Vietnam', nameKo: '베트남', lat: 14.1, lon: 108.3, marketSize: '$0.4B', growth: '+23.1%', brands: '한국산 의료기기 선호', classys: '급성장 시장', trend: '신흥 중산층 수요 급증' },
  { name: 'UAE', nameKo: 'UAE', lat: 23.4, lon: 53.8, marketSize: '$1.1B', growth: '+16.3%', brands: 'Cutera/Lumenis', classys: '중동 거점 두바이', trend: '럭셔리 클리닉 수요 고성장' },
  { name: 'Italy', nameKo: '이탈리아', lat: 41.9, lon: 12.6, marketSize: '$0.6B', growth: '+7.1%', brands: 'Deka/El.En', classys: '유럽 주요 배포국', trend: '피부과 시술 선호' },
  { name: 'UK', nameKo: '영국', lat: 55.4, lon: -3.4, marketSize: '$0.8B', growth: '+7.5%', brands: 'Cynosure/Syneron', classys: '영국 distributor 활성화', trend: 'Non-surgical 리프팅' },
  { name: 'Australia', nameKo: '호주', lat: -25.3, lon: 133.8, marketSize: '$0.6B', growth: '+9.1%', brands: '현지 직수입', classys: '호주 파트너 강화', trend: 'TGA 규제 강화' },
]

function getCountryContinent(numericId: number): string {
  for (const [continent, ids] of Object.entries(CONTINENT_MAP)) {
    if (ids.includes(numericId)) return continent
  }
  return 'Default'
}

interface TooltipState {
  x: number
  y: number
  data: MarketData
}

interface ModalState {
  data: MarketData
}

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 })

  const drawMap = useCallback(() => {
    const svgEl = svgRef.current
    const container = containerRef.current
    if (!svgEl || !container) return

    const width = container.clientWidth || 800
    const height = Math.round(width * 0.55)
    setDimensions({ width, height })

    // D3 setup
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    svg.attr('width', width).attr('height', height)

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.2)
      .translate([width / 2, height / 2])

    const pathGen = d3.geoPath().projection(projection)

    // zoom group
    const zoomGroup = svg.append('g').attr('class', 'zoom-group')

    // Ocean background
    zoomGroup.append('rect')
      .attr('class', 'ocean')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#e8f4f8')

    // Load topology
    import('world-atlas/countries-110m.json').then((module) => {
      const topology = module.default as unknown as WorldTopology

      // countries
      const countriesGeo = topojson.feature(topology, topology.objects.countries)
      const features = 'features' in countriesGeo ? countriesGeo.features : []

      // Draw countries
      const countriesGroup = zoomGroup.append('g').attr('class', 'countries')
      countriesGroup.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', (d) => pathGen(d) ?? '')
        .attr('fill', (d) => {
          const numId = parseInt(String(d.id ?? '0'), 10)
          const continent = getCountryContinent(numId)
          return CONTINENT_COLORS[continent] ?? CONTINENT_COLORS.Default
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.85)

      // Continent labels group
      const labelsGroup = zoomGroup.append('g').attr('class', 'continent-labels')
      CONTINENT_LABELS.forEach(({ name, lat, lon }) => {
        const coords = projection([lon, lat])
        if (!coords) return
        const [cx, cy] = coords

        labelsGroup.append('text')
          .attr('x', cx)
          .attr('y', cy)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', CONTINENT_COLORS[name] ?? '#555')
          .attr('font-size', Math.max(10, width / 95))
          .attr('font-weight', '700')
          .attr('font-family', 'system-ui, sans-serif')
          .attr('opacity', 0.9)
          .attr('pointer-events', 'none')
          .attr('stroke', 'rgba(255,255,255,0.8)')
          .attr('stroke-width', 3)
          .attr('paint-order', 'stroke')
          .text(name)
      })

      // Markers group
      const markersGroup = zoomGroup.append('g').attr('class', 'markers')
      MARKET_DATA.forEach((d) => {
        const coords = projection([d.lon, d.lat])
        if (!coords) return
        const [cx, cy] = coords
        const r = Math.max(5, width / 140)

        const g = markersGroup.append('g')
          .attr('transform', `translate(${cx},${cy})`)
          .style('cursor', 'pointer')

        // Outer pulse ring
        g.append('circle')
          .attr('r', r * 1.8)
          .attr('fill', 'rgba(255,255,255,0.25)')
          .attr('stroke', 'rgba(255,255,255,0.6)')
          .attr('stroke-width', 1)

        // Main dot
        g.append('circle')
          .attr('r', r)
          .attr('fill', '#ffffff')
          .attr('stroke', '#002D74')
          .attr('stroke-width', 1.5)

        // Hover & click events
        g.on('mouseenter', function (event: MouseEvent) {
          d3.select(this).select('circle:last-of-type')
            .attr('fill', '#FFD700')
            .attr('r', r * 1.3)

          const svgRect = svgEl.getBoundingClientRect()
          setTooltip({
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
            data: d,
          })
        })

        g.on('mousemove', function (event: MouseEvent) {
          const svgRect = svgEl.getBoundingClientRect()
          setTooltip((prev) =>
            prev ? { ...prev, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top } : prev
          )
        })

        g.on('mouseleave', function () {
          d3.select(this).select('circle:last-of-type')
            .attr('fill', '#ffffff')
            .attr('r', r)
          setTooltip(null)
        })

        g.on('click', function () {
          setModal({ data: d })
        })
      })

      // Zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.8, 8])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          zoomGroup.attr('transform', event.transform.toString())
        })

      svg.call(zoom)
    })
  }, [])

  // ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      drawMap()
    })
    ro.observe(container)
    drawMap()

    return () => ro.disconnect()
  }, [drawMap])

  const growthColor = (g: string) =>
    g.startsWith('+') ? 'text-emerald-600' : 'text-red-500'

  return (
    <div className="relative flex flex-col bg-white" style={{ minHeight: 480 }}>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50">
        {Object.entries(CONTINENT_COLORS)
          .filter(([k]) => k !== 'Default')
          .map(([continent, color]) => (
            <span key={continent} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: color, opacity: 0.85 }}
              />
              {continent}
            </span>
          ))}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-white border border-gray-400" />
          마커 클릭 시 상세 정보
        </span>
      </div>

      {/* Map container */}
      <div ref={containerRef} className="relative w-full flex-1" style={{ minHeight: 440 }}>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl bg-gray-900/90 px-3 py-2 text-white shadow-xl backdrop-blur-sm"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10, maxWidth: 220 }}
          >
            <p className="font-semibold text-sm">{tooltip.data.nameKo} ({tooltip.data.name})</p>
            <p className="text-xs text-gray-300 mt-0.5">
              시장규모 <span className="text-white font-medium">{tooltip.data.marketSize}</span>
              <span className="mx-1 text-gray-500">·</span>
              YoY <span className={`font-medium ${growthColor(tooltip.data.growth)}`}>{tooltip.data.growth}</span>
            </p>
          </div>
        )}
      </div>

      {/* Zoom hint */}
      <div className="px-4 py-1.5 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
        스크롤로 줌 · 드래그로 이동 · 마커 클릭으로 상세 정보
      </div>

      {/* Detail Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div
              className="flex items-start justify-between px-6 py-4"
              style={{ background: 'linear-gradient(135deg, #002D74 0%, #0084C9 100%)' }}
            >
              <div>
                <h2 className="text-xl font-bold text-white">
                  {modal.data.nameKo}
                  <span className="ml-2 text-base font-normal text-blue-200">({modal.data.name})</span>
                </h2>
                <p className="text-sm text-blue-200 mt-0.5">글로벌 피부미용의료기기 시장 현황</p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="rounded-lg p-1.5 text-blue-200 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-3">
              {/* 시장규모 + 성장률 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-center">
                  <p className="text-xs text-blue-500 font-medium mb-1">시장 규모</p>
                  <p className="text-2xl font-bold text-blue-700">{modal.data.marketSize}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-center">
                  <p className="text-xs text-emerald-600 font-medium mb-1">YoY 성장률</p>
                  <p className={`text-2xl font-bold ${growthColor(modal.data.growth)}`}>{modal.data.growth}</p>
                </div>
              </div>

              {/* 상세 항목 */}
              {[
                { label: '주요 브랜드', value: modal.data.brands, icon: '🏭' },
                { label: 'CLASSYS 현황', value: modal.data.classys, icon: '📍' },
                { label: '주목 트렌드', value: modal.data.trend, icon: '📈' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    {icon} {label}
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">{value}</p>
                </div>
              ))}
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setModal(null)}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #002D74, #0084C9)' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
