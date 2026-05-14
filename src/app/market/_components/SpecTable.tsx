'use client'

import { useState, useMemo } from 'react'
import type { Competitor, DeviceCategory } from '../_data/competitors'

const CAT_COLORS: Record<DeviceCategory, string> = {
  HIFU: 'bg-sky-100 text-sky-700',
  NeedleRF: 'bg-violet-100 text-violet-700',
  RF: 'bg-orange-100 text-orange-700',
  Laser: 'bg-rose-100 text-rose-700',
  Body: 'bg-emerald-100 text-emerald-700',
  Injection: 'bg-pink-100 text-pink-700',
  Combo: 'bg-indigo-100 text-indigo-700',
}

const ALL_CATEGORIES: DeviceCategory[] = ['HIFU', 'RF', 'NeedleRF', 'Laser', 'Body', 'Injection', 'Combo']

type SortKey = 'company' | 'product' | 'year' | 'price'
type SortDir = 'asc' | 'desc'

interface Row {
  company_name: string
  company_name_ko?: string
  hq_flag: string
  is_classys: boolean
  matched: boolean
  color: string
  product_name: string
  category: DeviceCategory
  launch_year: number
  price_tier: string
  energy_type: string
  indications: string
  fda: boolean
  ce: boolean
  kfda: boolean
}

interface Props {
  competitors: Competitor[]
  matchSet: Set<string>
}

function CertBadge({ label, active, colorCls }: { label: string; active: boolean; colorCls: string }) {
  if (!active) return <span className="text-gray-200 text-xs select-none">—</span>
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colorCls}`}>
      {label}
    </span>
  )
}

function PriceDots({ tier }: { tier: string }) {
  const filled = tier === 'Premium' ? 3 : tier === 'Mid' ? 2 : 1
  const dotColor = tier === 'Premium' ? 'bg-violet-400' : tier === 'Mid' ? 'bg-yellow-400' : 'bg-gray-400'
  return (
    <div className="flex items-center gap-0.5" title={tier}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i <= filled ? dotColor : 'bg-gray-200'}`} />
      ))}
      <span className="ml-1 text-[10px] text-gray-500">{tier}</span>
    </div>
  )
}

export default function SpecTable({ competitors, matchSet }: Props) {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory | 'ALL'>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('company')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const rows: Row[] = useMemo(() => {
    const result: Row[] = []
    for (const c of competitors) {
      for (const p of c.products) {
        if (activeCategory !== 'ALL' && p.category !== activeCategory) continue
        result.push({
          company_name: c.company_name,
          company_name_ko: c.company_name_ko,
          hq_flag: c.hq_flag,
          is_classys: c.is_classys === true,
          matched: matchSet.has(c.competitor_id),
          color: c.color,
          product_name: p.product_name,
          category: p.category,
          launch_year: p.launch_year,
          price_tier: p.price_tier,
          energy_type: p.specs.energy_type ?? '—',
          indications: p.specs.indications?.join(', ') ?? '—',
          fda: p.certifications.includes('FDA'),
          ce: p.certifications.includes('CE'),
          kfda: p.certifications.includes('KFDA'),
        })
      }
    }
    return result
  }, [competitors, matchSet, activeCategory])

  const sorted = useMemo(() => {
    const classysRows = rows.filter((r) => r.is_classys)
    const otherRows = rows.filter((r) => !r.is_classys)

    const compare = (a: Row, b: Row): number => {
      let cmp = 0
      if (sortKey === 'company') cmp = a.company_name.localeCompare(b.company_name)
      else if (sortKey === 'product') cmp = a.product_name.localeCompare(b.product_name)
      else if (sortKey === 'year') cmp = a.launch_year - b.launch_year
      else if (sortKey === 'price') {
        const order = { Premium: 0, Mid: 1, Value: 2 }
        cmp = (order[a.price_tier as keyof typeof order] ?? 3) - (order[b.price_tier as keyof typeof order] ?? 3)
      }
      return sortDir === 'asc' ? cmp : -cmp
    }

    return [...classysRows, ...otherRows.sort(compare)]
  }, [rows, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1 text-[10px]">↕</span>
    return <span className="text-blue-500 ml-1 text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const availableCategories = useMemo(() => {
    const used = new Set(competitors.flatMap((c) => c.products.map((p) => p.category)))
    return ALL_CATEGORIES.filter((cat) => used.has(cat))
  }, [competitors])

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 p-4 border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            activeCategory === 'ALL'
              ? 'bg-gray-800 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
          }`}
        >
          전체
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeCategory === cat
                ? `${CAT_COLORS[cat]} shadow-sm`
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th
                className="text-left py-3 font-semibold text-gray-500 cursor-pointer hover:text-blue-600 whitespace-nowrap"
                style={{ paddingLeft: 16 }}
                onClick={() => handleSort('company')}
              >
                회사 <SortIcon col="company" />
              </th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-500 cursor-pointer hover:text-blue-600 whitespace-nowrap"
                onClick={() => handleSort('product')}
              >
                제품명 <SortIcon col="product" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 whitespace-nowrap">카테고리</th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-500 cursor-pointer hover:text-blue-600 whitespace-nowrap"
                onClick={() => handleSort('year')}
              >
                출시 <SortIcon col="year" />
              </th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-500 cursor-pointer hover:text-blue-600 whitespace-nowrap"
                onClick={() => handleSort('price')}
              >
                가격대 <SortIcon col="price" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 whitespace-nowrap">에너지 유형</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500" style={{ maxWidth: 180 }}>적응증</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500">FDA</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500">CE</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500">KFDA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((row, i) => (
              <tr
                key={i}
                className={[
                  'transition-all duration-150',
                  row.is_classys ? 'bg-blue-50/50' : 'hover:bg-gray-50/70',
                  !row.matched ? 'opacity-25' : '',
                ].join(' ')}
              >
                {/* Company column with left color accent */}
                <td className="py-0 whitespace-nowrap" style={{ padding: 0 }}>
                  <div className="flex items-stretch min-h-[52px]">
                    <div style={{ width: 3, flexShrink: 0, backgroundColor: row.color }} />
                    <div className="flex items-center gap-2 px-3 py-3">
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{row.hq_flag}</span>
                      <div>
                        <span className={`font-semibold ${row.is_classys ? 'text-blue-700' : 'text-gray-900'}`}>
                          {row.company_name}
                        </span>
                        {row.company_name_ko && (
                          <span className="block text-gray-400" style={{ fontSize: 10, marginTop: 1 }}>
                            {row.company_name_ko}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${row.is_classys ? 'text-blue-700' : 'text-gray-900'}`}>
                  {row.product_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${CAT_COLORS[row.category]}`}>
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono">
                  {row.launch_year || '—'}
                </td>
                <td className="px-4 py-3">
                  <PriceDots tier={row.price_tier} />
                </td>
                <td
                  className="px-4 py-3 text-gray-600 whitespace-nowrap"
                  style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={row.energy_type}
                >
                  {row.energy_type}
                </td>
                <td
                  className="px-4 py-3 text-gray-500"
                  style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={row.indications}
                >
                  {row.indications}
                </td>
                <td className="px-3 py-3 text-center">
                  <CertBadge label="FDA" active={row.fda} colorCls="bg-emerald-100 text-emerald-700" />
                </td>
                <td className="px-3 py-3 text-center">
                  <CertBadge label="CE" active={row.ce} colorCls="bg-blue-100 text-blue-700" />
                </td>
                <td className="px-3 py-3 text-center">
                  <CertBadge label="KFDA" active={row.kfda} colorCls="bg-amber-100 text-amber-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            해당 카테고리 제품이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
