'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Region, Competitor } from '../_data/competitors'

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------

const MAP_W = 960
const MAP_H = 500
const MIN_K = 0.7
const MAX_K = 22
const DEFAULT_TRANSFORM: MapTransform = { x: 0, y: 0, k: 1 }
const TRANSITION_DURATION = 480 // ms

// ISO 3166-1 numeric ID → Region 매핑
const REGION_COUNTRY_IDS: Record<Region, Set<number>> = {
  Korea: new Set([410]),
  China: new Set([156]),
  NA: new Set([
    840, 124, 484, 630, 558, 340, 320, 222, 188, 388, 332, 192,
    780, 28, 52, 84, 44, 60, 308, 214, 312, 659, 212, 474, 670, 92, 850,
  ]),
  EU: new Set([
    276, 250, 724, 380, 528, 620, 56, 756, 40, 372, 752, 578, 208, 246,
    233, 428, 440, 616, 203, 703, 705, 191, 348, 642, 100, 300, 807, 70,
    688, 499, 8, 20, 442, 470, 196, 112, 804, 498, 826, 352, 438, 492,
  ]),
  SEA: new Set([764, 704, 702, 458, 360, 608, 104, 116, 418, 96, 626]),
  Others: new Set([]),
}

const REGION_LABELS: Record<Region, string> = {
  Korea: '국내', NA: '북미', EU: '유럽', China: '중국', SEA: '동남아', Others: '기타',
}

const REGION_COLORS: Record<Region, string> = {
  Korea: '#3B82F6', NA: '#F59E0B', EU: '#8B5CF6',
  China: '#EF4444', SEA: '#10B981', Others: '#9CA3AF',
}

// 지역 레이블 앵커 (경도, 위도)
const REGION_ANCHORS: Partial<Record<Region, [number, number]>> = {
  Korea: [127, 36],
  China: [103, 35],
  NA: [-100, 48],
  EU: [15, 52],
  SEA: [116, 4],
}

// 지역별 거점 도시 좌표 (경도, 위도) — presence dot 표시용
const PRESENCE_HUBS: Partial<Record<Region, [number, number]>> = {
  Korea: [126.9, 37.5],   // 서울
  China: [121.5, 31.2],   // 상하이
  NA: [-87.6, 41.8],      // 시카고
  EU: [13.4, 52.5],       // 베를린
  SEA: [103.8, 1.3],      // 싱가포르
}

// 주요 국가명 (툴팁용)
const COUNTRY_NAMES = new Map<number, string>([
  [840, 'United States'], [124, 'Canada'], [484, 'Mexico'],
  [276, 'Germany'], [250, 'France'], [724, 'Spain'], [380, 'Italy'],
  [528, 'Netherlands'], [826, 'United Kingdom'], [620, 'Portugal'],
  [56, 'Belgium'], [756, 'Switzerland'], [40, 'Austria'], [372, 'Ireland'],
  [752, 'Sweden'], [578, 'Norway'], [208, 'Denmark'], [246, 'Finland'],
  [616, 'Poland'], [203, 'Czechia'], [642, 'Romania'], [300, 'Greece'],
  [410, 'South Korea'], [156, 'China'], [392, 'Japan'], [356, 'India'],
  [764, 'Thailand'], [704, 'Vietnam'], [702, 'Singapore'],
  [458, 'Malaysia'], [360, 'Indonesia'], [608, 'Philippines'],
  [104, 'Myanmar'], [116, 'Cambodia'], [418, 'Laos'],
  [36, 'Australia'], [554, 'New Zealand'],
  [643, 'Russia'], [792, 'Turkey'], [682, 'Saudi Arabia'], [784, 'UAE'],
  [818, 'Egypt'], [710, 'South Africa'], [566, 'Nigeria'],
  [76, 'Brazil'], [32, 'Argentina'], [152, 'Chile'],
])

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

interface MapTransform { x: number; y: number; k: number }

interface CountryPath {
  id: number
  d: string
  region: Region | null
}

interface TooltipData {
  /** SVG 컨테이너 기준 px 좌표 */
  x: number
  y: number
  countryName: string
  region: Region | null
  companies: string[]
}

interface Props {
  competitors: Competitor[]
  matchSet: Set<string>
  selectedRegions: Set<Region>
  onRegionToggle: (region: Region) => void
  onDotClick?: (region: Region) => void
}

// ---------------------------------------------------------------------------
// 순수 헬퍼
// ---------------------------------------------------------------------------

function getRegionForId(id: number): Region | null {
  for (const [region, ids] of Object.entries(REGION_COUNTRY_IDS) as [Region, Set<number>][]) {
    if (region === 'Others') continue
    if (ids.has(id)) return region
  }
  return 'Others'
}

/** 특정 SVG 좌표를 중심으로 줌 */
function zoomAround(prev: MapTransform, cx: number, cy: number, factor: number): MapTransform {
  const newK = Math.max(MIN_K, Math.min(MAX_K, prev.k * factor))
  const ratio = newK / prev.k
  return { k: newK, x: cx - (cx - prev.x) * ratio, y: cy - (cy - prev.y) * ratio }
}

/** 지도 뷰포트 중심 기준으로 줌 */
function zoomCenter(prev: MapTransform, factor: number): MapTransform {
  return zoomAround(prev, MAP_W / 2, MAP_H / 2, factor)
}

/** SVG bbox → 뷰포트에 맞는 transform 계산 */
function fitTransform(
  x0: number, y0: number, x1: number, y1: number,
  viewW: number, viewH: number,
  padding = 0.82,
): MapTransform {
  const dx = x1 - x0
  const dy = y1 - y0
  if (dx < 1 || dy < 1) return DEFAULT_TRANSFORM
  const k = Math.min(viewW / dx, viewH / dy) * padding
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  return { k, x: viewW / 2 - k * cx, y: viewH / 2 - k * cy }
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

export default function WorldMap({ competitors, matchSet, selectedRegions, onRegionToggle, onDotClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [features, setFeatures] = useState<{ id: number; geometry: object | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [transform, setTransform] = useState<MapTransform>(DEFAULT_TRANSFORM)
  const [animating, setAnimating] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [zoomedRegion, setZoomedRegion] = useState<Region | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 드래그 상태는 ref로 관리 (re-render 없이 빠른 업데이트)
  const drag = useRef({ active: false, startX: 0, startY: 0, startTx: 0, startTy: 0, moved: false })
  // 애니메이션 타이머 ref (클린업용)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── TopoJSON 데이터 fetch (단일 요청) ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then((topo: Topology<{ countries: GeometryCollection }>) => {
        if (cancelled) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geo = topojson.feature(topo, topo.objects.countries) as any
        setFeatures(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (geo.features as any[]).map((f: any, idx: number) => {
            const numId = Number(f.id)
            return {
              // id 없는 feature는 음수 인덱스로 고유 식별 (NaN 방지)
              id: Number.isFinite(numId) ? numId : -(idx + 1),
              geometry: f.geometry ?? null,
            }
          }),
        )
      })
      .catch(() => {/* 네트워크 오류 — 빈 지도 표시 */})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // ─── Projection — 최초 1회만 생성, 절대 변경하지 않음 ─────────────────────
  // (줌/패닝은 SVG <g transform> 으로 처리 — projection 변경 시 NaN 좌표 발생)
  const projection = useMemo(
    () => d3.geoNaturalEarth1().scale(160).translate([MAP_W / 2, MAP_H / 2]),
    [],
  )

  const pathGenerator = useMemo(() => d3.geoPath(projection), [projection])

  // ─── 국가 paths — features 로드 시 1회 계산 ───────────────────────────────
  const countryPaths = useMemo<CountryPath[]>(
    () =>
      features
        .map(f => ({
          id: f.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          d: pathGenerator(f.geometry as any) ?? '',
          region: getRegionForId(f.id),
        }))
        .filter(p => p.d.length > 0), // 빈 path 제거
    [features, pathGenerator],
  )

  // ─── 매칭된 경쟁사의 활성 지역 ──────────────────────────────────────────────
  const activeRegions = useMemo(() => {
    const s = new Set<Region>()
    competitors.forEach(c => {
      if (matchSet.has(c.competitor_id)) c.markets.forEach(m => s.add(m))
    })
    return s
  }, [competitors, matchSet])

  // ─── 지역별 경쟁사 목록 캐시 ─────────────────────────────────────────────────
  const regionCompanies = useMemo(() => {
    const map = new Map<Region, string[]>()
    competitors.forEach(c => {
      if (!matchSet.has(c.competitor_id)) return
      c.markets.forEach(m => {
        if (!map.has(m)) map.set(m, [])
        map.get(m)!.push(c.company_name)
      })
    })
    return map
  }, [competitors, matchSet])

  // ─── 애니메이션 트리거 헬퍼 ──────────────────────────────────────────────────
  const animateTo = useCallback((target: MapTransform) => {
    if (animTimer.current) clearTimeout(animTimer.current)
    setAnimating(true)
    setTransform(target)
    animTimer.current = setTimeout(() => setAnimating(false), TRANSITION_DURATION)
  }, [])

  // ─── 지역 zoom-to-fit: pathGenerator.bounds() 로 SVG bbox 계산 ────────────
  const zoomToRegion = useCallback(
    (region: Region) => {
      const regionFeats = features.filter(f => getRegionForId(f.id) === region)
      if (regionFeats.length === 0) return
      try {
        const [[x0, y0], [x1, y1]] = pathGenerator.bounds({
          type: 'FeatureCollection',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          features: regionFeats.map(f => ({ type: 'Feature', geometry: f.geometry, properties: {} })) as any,
        })
        if ([x0, y0, x1, y1].some(v => !isFinite(v))) return
        animateTo(fitTransform(x0, y0, x1, y1, MAP_W, MAP_H))
      } catch {
        // bounds 계산 실패 시 무시
      }
    },
    [features, pathGenerator, animateTo],
  )

  // ─── 줌 버튼 ────────────────────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    if (animTimer.current) clearTimeout(animTimer.current)
    setAnimating(true)
    setTransform(prev => zoomCenter(prev, 1.6))
    animTimer.current = setTimeout(() => setAnimating(false), TRANSITION_DURATION)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (animTimer.current) clearTimeout(animTimer.current)
    setAnimating(true)
    setTransform(prev => zoomCenter(prev, 1 / 1.6))
    animTimer.current = setTimeout(() => setAnimating(false), TRANSITION_DURATION)
  }, [])

  const handleReset = useCallback(() => {
    animateTo(DEFAULT_TRANSFORM)
    setZoomedRegion(null)
  }, [animateTo])

  // ─── 스크롤 줌 (passive: false 필수) ────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const svgX = (e.clientX - rect.left) * (MAP_W / rect.width)
      const svgY = (e.clientY - rect.top) * (MAP_H / rect.height)
      const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2
      setTransform(prev => zoomAround(prev, svgX, svgY, factor))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ─── 더블클릭 줌인 ──────────────────────────────────────────────────────────
  const handleDblClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const svgX = (e.clientX - rect.left) * (MAP_W / rect.width)
    const svgY = (e.clientY - rect.top) * (MAP_H / rect.height)
    if (animTimer.current) clearTimeout(animTimer.current)
    setAnimating(true)
    setTransform(prev => zoomAround(prev, svgX, svgY, 2))
    animTimer.current = setTimeout(() => setAnimating(false), TRANSITION_DURATION)
  }, [])

  // ─── Pointer 드래그 ─────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startTx: transform.x,
      startTy: transform.y,
      moved: false,
    }
    setIsDragging(true)
    ;(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId)
  }, [transform.x, transform.y])

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTransform(prev => ({
      k: prev.k,
      x: drag.current.startTx + dx * (MAP_W / rect.width),
      y: drag.current.startTy + dy * (MAP_H / rect.height),
    }))
    if (drag.current.moved) setTooltip(null)
  }, [])

  const handlePointerUp = useCallback(() => {
    drag.current.active = false
    setIsDragging(false)
  }, [])

  // ─── 지역 클릭 (toggle + zoom) ───────────────────────────────────────────────
  const handleRegionClick = useCallback(
    (region: Region) => {
      onRegionToggle(region)
      if (zoomedRegion === region) {
        setZoomedRegion(null)
        animateTo(DEFAULT_TRANSFORM)
      } else {
        setZoomedRegion(region)
        zoomToRegion(region)
      }
    },
    [onRegionToggle, zoomedRegion, animateTo, zoomToRegion],
  )

  // ─── 국가 hover 툴팁 ─────────────────────────────────────────────────────────
  const handleCountryMouseMove = useCallback(
    (e: React.MouseEvent<SVGPathElement>, id: number, region: Region | null) => {
      if (drag.current.moved) return
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        countryName: COUNTRY_NAMES.get(id) ?? `#${id}`,
        region,
        companies: region ? (regionCompanies.get(region) ?? []).slice(0, 5) : [],
      })
    },
    [regionCompanies],
  )

  // ─── 국가 fill 색상 ──────────────────────────────────────────────────────────
  const getFill = useCallback(
    (region: Region | null): string => {
      if (!region || region === 'Others') return '#D1D5DB'
      if (selectedRegions.size > 0 && !selectedRegions.has(region)) return '#E5E7EB'
      if (activeRegions.has(region)) return REGION_COLORS[region]
      return `${REGION_COLORS[region]}50`
    },
    [selectedRegions, activeRegions],
  )

  // ─── 줌 레벨 표시 ────────────────────────────────────────────────────────────
  const zoomPct = Math.round(transform.k * 100)

  // ─── 레이블 폰트 크기 (줌에 반비례하여 일정하게 유지) ──────────────────────────
  const labelFontSize = Math.round(Math.max(7, Math.min(13, 9 / transform.k)))
  const strokeAdjust = 1 / transform.k

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 지역 범례 칩 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(REGION_LABELS) as Region[])
            .filter(r => r !== 'Others')
            .map(region => (
              <button
                key={region}
                onClick={() => handleRegionClick(region)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200',
                  selectedRegions.has(region)
                    ? 'text-white border-transparent shadow-sm scale-105'
                    : zoomedRegion === region
                      ? 'bg-white font-semibold border-2'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                ].join(' ')}
                style={
                  selectedRegions.has(region)
                    ? { backgroundColor: REGION_COLORS[region] }
                    : zoomedRegion === region
                      ? { borderColor: REGION_COLORS[region], color: REGION_COLORS[region] }
                      : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: REGION_COLORS[region] }}
                />
                {REGION_LABELS[region]}
                {activeRegions.has(region) && (
                  <span className="ml-0.5 text-[9px] opacity-70">
                    {regionCompanies.get(region)?.length ?? 0}
                  </span>
                )}
              </button>
            ))}
        </div>
        {(zoomedRegion || selectedRegions.size > 0) && (
          <button
            onClick={() => {
              handleReset()
              selectedRegions.forEach(r => onRegionToggle(r))
            }}
            className="text-xs text-blue-600 hover:underline shrink-0"
          >
            전체 보기
          </button>
        )}
      </div>

      {/* 지도 컨테이너 */}
      <div className="relative select-none" style={{ height: 420 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/40 z-10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              지도 데이터 로딩 중…
            </div>
          </div>
        )}

        {/* SVG 지도 */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { drag.current.active = false; setIsDragging(false); setTooltip(null) }}
          onDoubleClick={handleDblClick}
        >
          {/* 바다 */}
          <rect width={MAP_W} height={MAP_H} fill="#DBEAFE" />

          {/* ★ 모든 줌/패닝은 이 <g>의 transform만 변경 — projection은 절대 건드리지 않음 */}
          <g
            transform={`translate(${transform.x.toFixed(2)},${transform.y.toFixed(2)}) scale(${transform.k.toFixed(4)})`}
            style={{
              transition: animating
                ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : 'none',
            }}
          >
            {/* 국가 paths — 선언적 map (zoom해도 재계산 없음) */}
            {countryPaths.map(({ id, d, region }) => (
              <path
                key={String(id)}
                d={d}
                fill={getFill(region)}
                stroke="#fff"
                strokeWidth={strokeAdjust * 0.4}
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'fill 0.25s' }}
                className={region && region !== 'Others' ? 'cursor-pointer' : 'cursor-default'}
                onClick={e => {
                  e.stopPropagation()
                  if (!drag.current.moved && region && region !== 'Others') {
                    handleRegionClick(region)
                  }
                }}
                onMouseMove={e => handleCountryMouseMove(e, id, region)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}

            {/* Presence dots — 지역별 경쟁사 현황 표시 */}
            {(Object.entries(PRESENCE_HUBS) as [Region, [number, number]][]).map(([region, [lon, lat]]) => {
              const pt = projection([lon, lat])
              if (!pt) return null
              const count = regionCompanies.get(region)?.length ?? 0
              if (count === 0) return null
              const isActive = activeRegions.has(region)
              const isSelected = selectedRegions.has(region)
              // 화면 픽셀 기준 크기 → SVG 단위로 변환 (transform.k로 나눔)
              const screenBaseR = 5 + Math.sqrt(count) * 1.8
              const r = screenBaseR / transform.k
              const ringR = r * 1.75
              const strokeW = 1.5 / transform.k
              const labelSize = 7.5 / transform.k

              return (
                <g
                  key={`hub-${region}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!drag.current.moved) onDotClick?.(region)
                  }}
                >
                  {/* Outer glow ring */}
                  <circle
                    cx={pt[0]} cy={pt[1]} r={ringR}
                    fill={REGION_COLORS[region]}
                    opacity={isActive || isSelected ? 0.22 : 0.1}
                  />
                  {/* Main filled dot */}
                  <circle
                    cx={pt[0]} cy={pt[1]} r={r}
                    fill={REGION_COLORS[region]}
                    opacity={isActive || isSelected ? 1 : 0.55}
                    stroke="white"
                    strokeWidth={strokeW}
                  />
                  {/* Company count label */}
                  <text
                    x={pt[0]} y={pt[1]}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={labelSize}
                    fill="white"
                    fontWeight="700"
                    pointerEvents="none"
                  >
                    {count}
                  </text>
                </g>
              )
            })}

            {/* 지역 레이블 — transform 그룹 내부에서 역비례 스케일로 일정 크기 유지 */}
            {(Object.entries(REGION_ANCHORS) as [Region, [number, number]][]).map(
              ([region, [lon, lat]]) => {
                const pt = projection([lon, lat])
                if (!pt) return null
                return (
                  <text
                    key={region}
                    x={pt[0]}
                    y={pt[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={labelFontSize}
                    fontWeight="700"
                    fill={
                      activeRegions.has(region) || selectedRegions.has(region)
                        ? REGION_COLORS[region]
                        : '#9CA3AF'
                    }
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={strokeAdjust * 2.5}
                    paintOrder="stroke"
                    pointerEvents="none"
                    style={{ transition: 'fill 0.25s' }}
                  >
                    {REGION_LABELS[region]}
                  </text>
                )
              },
            )}
          </g>
        </svg>

        {/* 컨트롤 패널 (우상단 오버레이) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors font-bold text-base leading-none select-none"
            title="줌인 (scroll up)"
          >
            +
          </button>

          <div className="w-8 h-6 bg-white/95 backdrop-blur-sm rounded border border-gray-200 flex items-center justify-center">
            <span className="text-[9px] text-gray-400 font-mono font-medium leading-none">
              {zoomPct}%
            </span>
          </div>

          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors font-bold text-base leading-none select-none"
            title="줌아웃 (scroll down)"
          >
            −
          </button>

          <div className="w-8 border-t border-gray-200 my-0.5" />

          <button
            onClick={handleReset}
            className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
            title="전체 보기로 리셋"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        {/* 툴팁 */}
        {tooltip && !isDragging && (
          <div
            className="absolute z-20 pointer-events-none bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-xl px-3 py-2.5 min-w-[120px] max-w-[200px]"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 12,
              // 우측 경계 overflow 방지
              transform: tooltip.x > 720 ? 'translateX(calc(-100% - 28px))' : undefined,
            }}
          >
            <p className="font-semibold text-white truncate">{tooltip.countryName}</p>
            {tooltip.region && tooltip.region !== 'Others' && (
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: REGION_COLORS[tooltip.region] }}>
                {REGION_LABELS[tooltip.region]}
              </p>
            )}
            {tooltip.companies.length > 0 && (
              <div className="mt-2 pt-1.5 border-t border-white/15">
                <p className="text-[9px] text-gray-400 mb-1">진출 경쟁사 ({tooltip.companies.length})</p>
                <div className="space-y-0.5">
                  {tooltip.companies.map(name => (
                    <p key={name} className="text-[10px] text-gray-200 truncate">{name}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 상태 바 */}
      <div className="px-5 py-2.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-4">
        <p className="text-[11px] text-gray-400">
          {zoomedRegion
            ? `${REGION_LABELS[zoomedRegion]} 확대 중 · 다시 클릭하거나 ⊡ 버튼으로 전체 보기`
            : '지역 클릭 → zoom-to-fit · 드래그 → 패닝 · 스크롤 · 더블클릭 → 줌인'}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {activeRegions.size > 0 && (
            <span className="text-[11px] text-gray-400">
              {activeRegions.size}개 지역 활성
            </span>
          )}
          <span className="text-[11px] text-gray-300 font-mono">{zoomPct}%</span>
        </div>
      </div>
    </div>
  )
}
