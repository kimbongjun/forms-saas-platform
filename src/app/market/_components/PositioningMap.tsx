'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from 'recharts'
import type { Competitor } from '../_data/competitors'

interface Props {
  competitors: Competitor[]
  matchSet: Set<string>
}

interface TooltipPayload {
  payload: {
    company_name: string
    company_name_ko?: string
    revenue_m: number
    price_score: number
    tech_score: number
  }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-900">{d.company_name}</p>
      {d.company_name_ko && <p className="text-gray-400">{d.company_name_ko}</p>}
      <p className="mt-1 text-gray-600">매출: <span className="font-medium">${d.revenue_m}M</span></p>
      <p className="text-gray-600">가격: <span className="font-medium">{d.price_score}/10</span></p>
      <p className="text-gray-600">기술: <span className="font-medium">{d.tech_score}/10</span></p>
    </div>
  )
}

// 버블 크기: 매출 min 400 ~ max 3600 (z 범위 기준 recharts ZAxis range)
function revenueToZ(revenue: number): number {
  const min = 28
  const max = 448
  const clamped = Math.max(min, Math.min(max, revenue))
  const normalized = (clamped - min) / (max - min)
  return 400 + normalized * 3200
}

export default function PositioningMap({ competitors, matchSet }: Props) {
  const data = competitors.map((c) => ({
    x: c.positioning.price_score,
    y: c.positioning.tech_score,
    z: revenueToZ(c.positioning.revenue_m),
    company_name: c.company_name,
    company_name_ko: c.company_name_ko,
    revenue_m: c.positioning.revenue_m,
    price_score: c.positioning.price_score,
    tech_score: c.positioning.tech_score,
    color: c.color,
    is_classys: c.is_classys,
    matched: matchSet.has(c.competitor_id),
    competitor_id: c.competitor_id,
  }))

  // 클래시스 마지막에 렌더(z-index 최상위)
  const sorted = [...data].sort((a) => (a.is_classys ? 1 : -1))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="relative">
        {/* 사분면 레이블 */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{ left: 48, bottom: 36 }}>
          <div className="relative w-full h-full">
            <span className="absolute top-2 left-2 text-[11px] text-gray-300 font-medium select-none">
              고기술 / 가성비
            </span>
            <span className="absolute top-2 right-2 text-[11px] text-blue-200 font-medium select-none">
              프리미엄 혁신 (Classys 영역)
            </span>
            <span className="absolute bottom-8 left-2 text-[11px] text-gray-300 font-medium select-none">
              보급형
            </span>
            <span className="absolute bottom-8 right-2 text-[11px] text-gray-300 font-medium select-none">
              고가 레거시
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 11]}
              name="가격 포지셔닝"
              label={{ value: 'Value ← 가격 포지셔닝 → Premium', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#9ca3af' }}
              tick={{ fontSize: 11 }}
              tickCount={6}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 11]}
              name="기술 복잡도"
              label={{ value: '기술 복잡도', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#9ca3af' }}
              tick={{ fontSize: 11 }}
              tickCount={6}
            />
            <ZAxis type="number" dataKey="z" range={[400, 3600]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={sorted} isAnimationActive={false}>
              {sorted.map((entry) => (
                <Cell
                  key={entry.competitor_id}
                  fill={entry.color}
                  fillOpacity={entry.matched ? (entry.is_classys ? 1 : 0.75) : 0.15}
                  stroke={entry.is_classys ? '#1d4ed8' : entry.color}
                  strokeWidth={entry.is_classys ? 2 : 0}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">버블 크기 = 추정 매출 규모 · 필터 비매칭 버블은 투명 처리</p>
    </div>
  )
}
