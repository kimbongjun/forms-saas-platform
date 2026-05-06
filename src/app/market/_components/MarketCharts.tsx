'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'

const REGIONAL_DATA = [
  { region: 'Asia Pacific', size: 8.6, growth: 16.2, color: '#0084C9' },
  { region: 'North America', size: 5.3, growth: 8.3, color: '#ff6b35' },
  { region: 'Europe', size: 4.1, growth: 6.8, color: '#48BB78' },
  { region: 'Latin America', size: 1.4, growth: 11.2, color: '#38A169' },
  { region: 'Middle East', size: 1.1, growth: 16.3, color: '#D69E2E' },
  { region: 'Oceania', size: 0.6, growth: 9.1, color: '#ED8936' },
]

const DEVICE_CATEGORIES = [
  { name: 'Energy-Based', value: 38, color: '#0084C9' },
  { name: 'HIFU/Ultrasound', value: 22, color: '#002D74' },
  { name: 'Body Contouring', value: 18, color: '#48BB78' },
  { name: 'Laser Systems', value: 14, color: '#9F7AEA' },
  { name: 'Injectables', value: 8, color: '#ED8936' },
]

const GROWTH_TREND = [
  { year: '2022', actual: 14.2, forecast: null },
  { year: '2023', actual: 16.8, forecast: null },
  { year: '2024', actual: 19.4, forecast: null },
  { year: '2025', actual: 22.1, forecast: null },
  { year: '2026', actual: null, forecast: 24.9 },
  { year: '2027', actual: null, forecast: 28.3 },
  { year: '2028', actual: null, forecast: 32.6 },
]

const WORD_CLOUD_DATA = [
  { text: 'HIFU', count: 4820 },
  { text: 'RF Lifting', count: 3910 },
  { text: 'AI Diagnostics', count: 3640 },
  { text: 'SaMD', count: 2940 },
  { text: 'K-Beauty', count: 2680 },
  { text: 'FDA 510(k)', count: 2440 },
  { text: 'EU MDR', count: 2180 },
  { text: 'Non-invasive', count: 1950 },
  { text: 'Body Contouring', count: 1730 },
  { text: 'KOL Marketing', count: 1610 },
  { text: 'Thermage', count: 1420 },
  { text: 'EMFACE', count: 1310 },
  { text: 'PicoLaser', count: 1180 },
  { text: 'Medical Tourism', count: 980 },
  { text: 'CE Mark', count: 870 },
  { text: 'Ultherapy', count: 760 },
  { text: 'NMPA', count: 650 },
  { text: 'Anti-aging', count: 540 },
]

interface CustomBarTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomBarTooltip({ active, payload, label }: CustomBarTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold">${p.value}B</span>
        </div>
      ))}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieLabel(props: any) {
  const cx = (props.cx as number) ?? 0
  const cy = (props.cy as number) ?? 0
  const midAngle = (props.midAngle as number) ?? 0
  const outerRadius = (props.outerRadius as number) ?? 72
  const percent = (props.percent as number) ?? 0
  const name = (props.name as string) ?? ''
  if (percent < 0.08) return null
  const RADIAN = Math.PI / 180
  const r = outerRadius + 28
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#4B5563" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={500}>
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  )
}

function WordCloud() {
  const max = Math.max(...WORD_CLOUD_DATA.map(w => w.count))
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 px-2">
      {WORD_CLOUD_DATA.map(({ text, count }, i) => {
        const ratio = count / max
        const size = Math.round(11 + ratio * 22)
        const opacity = 0.5 + ratio * 0.5
        const hue = 210 + i * 12
        return (
          <span
            key={text}
            className="cursor-default rounded-lg px-2 py-0.5 font-semibold transition-transform hover:scale-110 hover:opacity-100"
            style={{
              fontSize: `${size}px`,
              opacity,
              color: `hsl(${hue}, 70%, 38%)`,
              background: `hsla(${hue}, 80%, 95%, 0.9)`,
              border: `1px solid hsla(${hue}, 60%, 80%, 0.6)`,
            }}
          >
            {text}
          </span>
        )
      })}
    </div>
  )
}

export default function MarketCharts() {
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto w-full">

      {/* Regional Market Size + Growth */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold" style={{ color: '#2C3E50' }}>지역별 시장 규모 (2026E, USD B)</h2>
          <p className="mb-4 text-xs text-gray-400">글로벌 피부미용의료기기 시장 지역별 현황</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REGIONAL_DATA} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} unit="B" />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="size" name="시장 규모" radius={[4, 4, 0, 0]}>
                {REGIONAL_DATA.map((entry) => (
                  <Cell key={entry.region} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold" style={{ color: '#2C3E50' }}>지역별 YoY 성장률 (%)</h2>
          <p className="mb-4 text-xs text-gray-400">아시아·중동 시장 고성장 지속</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REGIONAL_DATA} margin={{ top: 4, right: 8, left: -12, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} unit="%" />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} width={90} />
              <Tooltip formatter={(v) => [`${v}%`, 'YoY 성장률']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="growth" name="성장률" radius={[0, 4, 4, 0]}>
                {REGIONAL_DATA.map((entry) => (
                  <Cell key={entry.region} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Categories + Growth Forecast */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold" style={{ color: '#2C3E50' }}>기기 카테고리별 시장 점유율</h2>
          <p className="mb-4 text-xs text-gray-400">Energy-based 기기가 시장 주도</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={DEVICE_CATEGORIES}
                cx="50%"
                cy="50%"
                outerRadius={72}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {DEVICE_CATEGORIES.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '점유율']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e5e7eb' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold" style={{ color: '#2C3E50' }}>글로벌 시장 규모 추이 & 전망 (USD B)</h2>
          <p className="mb-4 text-xs text-gray-400">실선: 실적 · 점선: 전망치 (2026–2028)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={GROWTH_TREND} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0084C9" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0084C9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9F7AEA" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#9F7AEA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} unit="B" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e5e7eb' }} formatter={(v) => [`$${v}B`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="actual" name="실적" stroke="#0084C9" strokeWidth={2.5} fill="url(#actualGrad)" connectNulls={false} dot={{ r: 3, fill: '#0084C9' }} />
              <Area type="monotone" dataKey="forecast" name="전망" stroke="#9F7AEA" strokeWidth={2} strokeDasharray="6 3" fill="url(#forecastGrad)" connectNulls={false} dot={{ r: 3, fill: '#9F7AEA', strokeDasharray: '0' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Word Cloud */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold" style={{ color: '#2C3E50' }}>글로벌 키워드 워드클라우드</h2>
        <p className="mb-2 text-xs text-gray-400">최근 7일 수집 데이터 기준 빈도 분석</p>
        <WordCloud />
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
          {WORD_CLOUD_DATA.slice(0, 6).map(({ text, count }) => (
            <div key={text} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs">
              <span className="text-gray-700 font-medium">{text}</span>
              <span className="text-gray-400">{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Share KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '글로벌 시장 규모', value: '$21.1B', sub: '2026 추정치', color: '#0084C9' },
          { label: 'CAGR (2024–2028)', value: '14.8%', sub: '복합 연평균 성장률', color: '#48BB78' },
          { label: '아시아 시장 비중', value: '40.8%', sub: '글로벌 1위 권역', color: '#FF6B35' },
          { label: '비침습 시술 비중', value: '68%', sub: '에너지 기반 + HIFU', color: '#9F7AEA' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-gray-700">{label}</p>
            <p className="mt-0.5 text-[10px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
