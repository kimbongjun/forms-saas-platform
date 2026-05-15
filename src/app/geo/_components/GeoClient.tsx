'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, ReferenceLine,
} from 'recharts'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import {
  GEO_DATA, DIMENSION_LABELS, SAMPLE_QUERIES, PERSPECTIVES,
  getScoreColor, type BrandGeoData, type AeoBenchmark,
  type TechAeo, type Authority, type Community, type EarnedMedia,
} from '../_data/geo-data'
import type { PlaygroundResult } from '@/app/api/geo/playground/route'
import type { YouTubeVideo } from '@/app/api/geo/youtube/route'

// ─── 공통 헬퍼 ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 100, color, label }: { score: number; size?: number; color: string; label?: string }) {
  const sw = size * 0.10
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={size * 0.26} fontWeight="700" fill="#111827">{score}</text>
      </svg>
      {label && <span className="text-sm font-medium text-slate-500">{label}</span>}
    </div>
  )
}

function StatusBadge({ text, variant }: { text: string; variant: 'green' | 'red' | 'gray' | 'blue' | 'amber' }) {
  const cls = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    red:   'bg-red-50 text-red-700 border-red-300',
    gray:  'bg-slate-100 text-slate-500 border-slate-300',
    blue:  'bg-blue-50 text-blue-700 border-blue-300',
    amber: 'bg-amber-50 text-amber-700 border-amber-300',
  }[variant]
  return (
    <span className={`inline-flex items-center text-sm font-semibold px-2.5 py-0.5 rounded border ${cls}`}>
      {text}
    </span>
  )
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline gap-4 pb-3 border-b border-slate-200 mb-5">
      <h3 className="text-base font-bold text-slate-700 uppercase tracking-[0.12em]">{children}</h3>
      {sub && <span className="text-sm text-slate-400">{sub}</span>}
    </div>
  )
}

function MetricCard({ label, value, unit, sub, accent }: { label: string; value: string | number; unit?: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-900">
        {value}
        {unit && <span className="text-base font-medium text-slate-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-sm mt-1" style={accent ? { color: accent } : { color: '#6B7280' }}>{sub}</p>}
    </div>
  )
}

// ─── Score Overview ───────────────────────────────────────────────────────────

function ScoreOverview({ brand }: { brand: BrandGeoData }) {
  const isBase = brand.id === 'volnewmer'
  const dimensions = [
    { label: 'Tech·AEO',  score: brand.tech.eeeat_score,            color: '#3B82F6' },
    { label: '지식소스',  score: brand.authority.authority_score,   color: '#10B981' },
    { label: 'AI 노출',   score: brand.aeo.visibility_score,        color: '#8B5CF6' },
    { label: '커뮤니티',  score: brand.community.community_score,   color: '#F59E0B' },
    { label: '미디어',    score: brand.earned_media.media_score,    color: '#EC4899' },
  ]
  return (
    <div className="bg-white rounded-lg border-2 p-6 mb-4" style={{ borderColor: isBase ? brand.color : '#E5E7EB' }}>
      {isBase && (
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center gap-3">
          <span className="text-sm font-bold px-3 py-1 rounded text-white" style={{ backgroundColor: brand.color }}>당사 브랜드</span>
          <span className="text-sm text-slate-500">경쟁사 대비 현재 GEO 최적화 현황</span>
        </div>
      )}
      <div className="flex items-center gap-8">
        <div className="shrink-0">
          <ScoreRing score={brand.geo_score} size={120} color={brand.color} label="GEO 종합" />
        </div>
        <div className="flex-1 space-y-4">
          {dimensions.map((d) => (
            <div key={d.label} className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-500 w-20 shrink-0">{d.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${d.score}%`, backgroundColor: d.color }} />
              </div>
              <span className="text-base font-bold text-slate-800 w-8 text-right shrink-0">{d.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

interface StrategicAction {
  priority: 'critical' | 'high' | 'medium'
  category: string
  title: string
  desc: string
  impact: string
  timeline: string
}

function computeActions(vol: BrandGeoData, all: BrandGeoData[]): StrategicAction[] {
  const actions: StrategicAction[] = []
  const topSchema = Math.max(...all.map(b => b.tech.schema_types.length))
  const topSov    = Math.max(...all.map(b => b.community.share_of_voice_pct))
  const topPapers = Math.max(...all.map(b => b.earned_media.academic_papers_2026))

  if (!vol.authority.sources.some(s => s.type === 'wikipedia' && s.exists))
    actions.push({ priority: 'critical', category: '지식소스', title: 'Wikipedia 한국어 문서 신규 등재',
      desc: '경쟁 브랜드(써마지·울쎄라) 대비 Wikipedia 미등재 상태. AI 답변에서 최우선 인용되는 권위 소스 확보가 가장 빠른 GEO 점수 상승 경로.',
      impact: '+8~12pts', timeline: '단기 (1~2개월)' })

  if (!vol.aeo.google_sge_featured)
    actions.push({ priority: 'critical', category: 'AI 노출', title: 'Google AI Overview 진입 전략 수립',
      desc: '써마지·울쎄라 모두 Google AI Overview 노출 확인됨. FAQPage 스키마 구조화 + E-E-A-T 의료 전문 콘텐츠 강화를 통한 Featured Snippet 확보 필요.',
      impact: '+10~15pts', timeline: '단기 (2~3개월)' })

  if (topSchema - vol.tech.schema_types.length > 0)
    actions.push({ priority: 'high', category: 'Tech·AEO', title: `JSON-LD 스키마 ${topSchema - vol.tech.schema_types.length}개 추가 구현`,
      desc: `현재 ${vol.tech.schema_types.length}개 적용 — MedicalProcedure, BreadcrumbList 등 AEO 가중치 높은 스키마 추가. 경쟁사 최대 ${topSchema}개 적용 중.`,
      impact: '+5~8pts', timeline: '단기 (2~4주)' })

  if (vol.community.share_of_voice_pct < topSov * 0.75)
    actions.push({ priority: 'high', category: '커뮤니티', title: '뷰티 커뮤니티 콘텐츠 발행 확대',
      desc: `현재 SoV ${vol.community.share_of_voice_pct}% — 시장 최고 ${topSov}% 대비 ${topSov - vol.community.share_of_voice_pct}%p 격차. AI는 커뮤니티 언급량·긍정 감성을 브랜드 신뢰도 지표로 활용함.`,
      impact: '+4~7pts', timeline: '중기 (3~6개월)' })

  if (vol.tech.lcp_ms > 2500)
    actions.push({ priority: 'medium', category: 'Tech·AEO', title: `Core Web Vitals 개선 — LCP ${(vol.tech.lcp_ms / 1000).toFixed(1)}s → 2.5s 이하`,
      desc: 'LCP 수치는 AI 크롤러 크롤 품질에 직접 영향을 미침. 이미지 최적화 및 CDN 적용으로 단기 개선 가능하며 CLS 0.14 → 0.1 이하 병행 권장.',
      impact: '+2~4pts', timeline: '단기 (2~4주)' })

  if (vol.earned_media.academic_papers_2026 < topPapers)
    actions.push({ priority: 'medium', category: '미디어', title: '학술 임상 논문 발표 강화',
      desc: `2026년 논문 ${vol.earned_media.academic_papers_2026}편 — 시장 최고치(${topPapers}편) 대비 미흡. PubMed 등재 논문은 AI 인용 가중치 최상위로 장기 GEO 경쟁력 결정.`,
      impact: '+3~5pts', timeline: '장기 (6~12개월)' })

  return actions.sort((a, b) => ({ critical: 0, high: 1, medium: 2 }[a.priority] - { critical: 0, high: 1, medium: 2 }[b.priority]))
}

const PRIORITY_CFG = {
  critical: { label: '즉시 실행', badgeCls: 'bg-red-50 text-red-700 border-red-300', borderCls: 'border-red-200' },
  high:     { label: '우선 실행', badgeCls: 'bg-amber-50 text-amber-700 border-amber-300', borderCls: 'border-amber-200' },
  medium:   { label: '계획 수립', badgeCls: 'bg-blue-50 text-blue-700 border-blue-300', borderCls: 'border-slate-200' },
}

function OverviewTab() {
  const vol      = GEO_DATA.find(b => b.id === 'volnewmer')!
  const thermage = GEO_DATA.find(b => b.id === 'thermage')!
  const ranked   = [...GEO_DATA].sort((a, b) => b.geo_score - a.geo_score)
  const actions  = computeActions(vol, GEO_DATA)
  const volRank  = ranked.findIndex(b => b.id === 'volnewmer') + 1

  const rankingChartData = ranked.map(b => ({
    name: b.name, score: b.geo_score, fill: b.id === 'volnewmer' ? b.color : '#9CA3AF',
  }))

  const dimensionGapData = [
    { dim: 'Tech·AEO',  볼뉴머: vol.tech.eeeat_score,           써마지: thermage.tech.eeeat_score },
    { dim: '지식소스',  볼뉴머: vol.authority.authority_score,  써마지: thermage.authority.authority_score },
    { dim: 'AI 노출',   볼뉴머: vol.aeo.visibility_score,       써마지: thermage.aeo.visibility_score },
    { dim: '커뮤니티',  볼뉴머: vol.community.community_score,  써마지: thermage.community.community_score },
    { dim: '미디어',    볼뉴머: vol.earned_media.media_score,   써마지: thermage.earned_media.media_score },
  ]

  const sovChartData = [...GEO_DATA].sort((a, b) => b.community.share_of_voice_pct - a.community.share_of_voice_pct)
    .map(b => ({ name: b.name, sov: b.community.share_of_voice_pct, fill: b.id === 'volnewmer' ? b.color : '#9CA3AF' }))

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border-2 p-6" style={{ borderColor: vol.color }}>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">볼뉴머 GEO 종합</p>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-5xl font-bold" style={{ color: vol.color }}>{vol.geo_score}</span>
            <span className="text-xl text-slate-400 mb-1">/ 100</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">시장 1위(써마지) 대비</p>
            <p className="text-xl font-bold text-red-600 mt-0.5">— {thermage.geo_score - vol.geo_score}pts 격차</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">경쟁 순위</p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-bold text-slate-900">{volRank}</span>
            <span className="text-xl text-slate-400 mb-1">위 / {GEO_DATA.length}개</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {ranked.slice(0, 3).map((b, i) => (
              <div key={b.id} className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 w-4">{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                <span className={`text-sm font-semibold flex-1 ${b.id === 'volnewmer' ? 'text-red-700' : 'text-slate-600'}`}>{b.name}</span>
                <span className="text-sm font-bold" style={{ color: b.color }}>{b.geo_score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">주요 개선 과제</p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-bold text-red-700">{actions.filter(a => a.priority === 'critical').length}</span>
            <span className="text-xl text-slate-400 mb-1">건 즉시 실행</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-sm text-slate-500">전체 {actions.length}개 액션 아이템</p>
            {actions.slice(0, 2).map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border shrink-0 ${PRIORITY_CFG[a.priority].badgeCls}`}>{PRIORITY_CFG[a.priority].label}</span>
                <span className="text-sm text-slate-600 leading-tight">{a.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand GEO Ranking Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <SectionTitle sub={`${GEO_DATA.length}개 브랜드 비교 · 2026-05 기준`}>전체 GEO 점수 순위</SectionTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height={288}>
            <BarChart data={rankingChartData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 64 }}>
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 13, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 15, fill: '#1E293B', fontWeight: 600 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}
                formatter={(v) => [`${v}점`, 'GEO 종합']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {rankingChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-slate-400 mt-2">볼뉴머(당사)는 강조 표시, 경쟁사는 회색으로 표기</p>
      </div>

      {/* Dimension Gap Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <SectionTitle sub="볼뉴머 vs 시장 1위(써마지) · 5개 분석 차원">차원별 경쟁 격차 분석</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={dimensionGapData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 56 }}>
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 13, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="dim" tick={{ fontSize: 15, fill: '#1E293B', fontWeight: 500 }} tickLine={false} axisLine={false} width={52} />
              <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v, n) => [`${v}점`, String(n)]} />
              <Legend wrapperStyle={{ fontSize: 14, paddingTop: 12 }} />
              <Bar dataKey="볼뉴머" fill="#B4221B" radius={[0, 3, 3, 0]} maxBarSize={16} />
              <Bar dataKey="써마지" fill="#D1D5DB" radius={[0, 3, 3, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SoV Bar Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <SectionTitle sub="커뮤니티 Share of Voice · 전 브랜드">시장 내 커뮤니티 점유율 비교</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={sovChartData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 64 }}>
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 13, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 15, fill: '#1E293B', fontWeight: 600 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v) => [`${v}%`, 'SoV']} />
              <Bar dataKey="sov" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {sovChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Plan */}
      <div>
        <SectionTitle sub="우선순위 기반 전략 로드맵">볼뉴머 GEO/AEO 최적화 액션 플랜</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {actions.map((action, i) => {
            const pc = PRIORITY_CFG[action.priority]
            return (
              <div key={i} className={`bg-white rounded-lg border-2 p-5 ${pc.borderCls}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-bold px-2.5 py-1 rounded border ${pc.badgeCls}`}>{pc.label}</span>
                  <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">{action.category}</span>
                </div>
                <p className="text-base font-bold text-slate-800 mb-2 leading-snug">{action.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{action.desc}</p>
                <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">예상 효과</p>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">{action.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">실행 기간</p>
                    <p className="text-base font-semibold text-slate-700 mt-0.5">{action.timeline}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dimension heatmap table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 pt-6 pb-1">
          <SectionTitle sub="전 브랜드 · 5개 차원 비교표">차원별 경쟁 현황 총괄</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-sm font-semibold text-slate-500 px-6 py-3">브랜드</th>
                <th className="text-center text-sm font-semibold text-slate-500 px-4 py-3">종합</th>
                {['Tech·AEO', '지식소스', 'AI 노출', '커뮤니티', '미디어'].map(h => (
                  <th key={h} className="text-center text-sm font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...GEO_DATA].sort((a, b) => b.geo_score - a.geo_score).map((b) => {
                const isOurs = b.id === 'volnewmer'
                const scores = [b.tech.eeeat_score, b.authority.authority_score, b.aeo.visibility_score, b.community.community_score, b.earned_media.media_score]
                return (
                  <tr key={b.id} className={isOurs ? 'bg-red-50/40' : 'hover:bg-slate-50/60'}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                        <span className={`text-sm font-bold ${isOurs ? 'text-red-700' : 'text-slate-800'}`}>{b.name}</span>
                        {isOurs && <span className="text-xs font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">당사</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-base font-bold" style={{ color: b.color }}>{b.geo_score}</span>
                    </td>
                    {scores.map((s, si) => (
                      <td key={si} className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold" style={{ color: getScoreColor(s) }}>{s}</span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 1: Tech·AEO ─────────────────────────────────────────────────────────

function TechAeoTab({ tech }: { tech: TechAeo }) {
  const vitals = [
    { label: 'LCP', value: `${(tech.lcp_ms / 1000).toFixed(1)}s`, good: tech.lcp_ms <= 2500, hint: '권장 ≤ 2.5s' },
    { label: 'CLS', value: tech.cls.toFixed(2),                    good: tech.cls <= 0.1,     hint: '권장 ≤ 0.1' },
    { label: 'Mobile Score', value: `${tech.mobile_score}`,        good: tech.mobile_score >= 80, hint: '권장 ≥ 80' },
  ]
  const allSchemas = ['MedicalProcedure', 'Product', 'FAQPage', 'Organization', 'BreadcrumbList', 'WebPage']
  return (
    <div className="space-y-6">
      {/* Schema */}
      <div>
        <SectionTitle sub={`적용 ${tech.schema_types.length}개 / 전체 ${allSchemas.length}개`}>스키마 마크업 (JSON-LD)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allSchemas.map((schema) => {
            const active = tech.schema_types.includes(schema)
            return (
              <div key={schema} className={`rounded-lg border p-4 flex items-center gap-3 ${active ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className={`w-3 h-3 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={`text-sm font-semibold ${active ? 'text-emerald-800' : 'text-slate-400'}`}>{schema}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm font-medium text-slate-600">FAQ 구조화 데이터</span>
          <StatusBadge text={tech.faq_schema ? '적용됨' : '미적용'} variant={tech.faq_schema ? 'green' : 'red'} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* E-E-A-T */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-base font-bold text-slate-700 mb-4">E-E-A-T 점수</p>
          <div className="flex items-center gap-5">
            <ScoreRing score={tech.eeeat_score} size={80} color={getScoreColor(tech.eeeat_score)} />
            <div className="flex-1 space-y-3">
              {[['Experience', 0.9], ['Expertise', 0.95], ['Authority', 0.85], ['Trust', 1.05]].map(([lbl, mul]) => {
                const val = Math.min(Math.round(tech.eeeat_score * (mul as number)), 100)
                return (
                  <div key={lbl as string} className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-20 shrink-0">{lbl as string}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: '#3B82F6' }} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-6 text-right">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-base font-bold text-slate-700 mb-4">Core Web Vitals</p>
          <div className="space-y-4">
            {vitals.map((v) => (
              <div key={v.label} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-700">{v.label}</span>
                  <span className="text-sm text-slate-400 ml-3">{v.hint}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`text-base font-bold ${v.good ? 'text-emerald-600' : 'text-red-600'}`}>{v.value}</span>
                  <div className={`w-2 h-2 rounded-full ${v.good ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-700">HTTPS / Sitemap</span>
              <div className="flex gap-2">
                <StatusBadge text={tech.https ? 'HTTPS' : 'HTTP'} variant={tech.https ? 'green' : 'red'} />
                <StatusBadge text={tech.sitemap ? 'Sitemap 있음' : 'Sitemap 없음'} variant={tech.sitemap ? 'green' : 'red'} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400">점검 일자: {tech.checked_at}</p>
    </div>
  )
}

// ─── Tab 2: 지식소스 ─────────────────────────────────────────────────────────

function AuthorityTab({ authority }: { authority: Authority }) {
  const sourceTypeLabel: Record<string, string> = {
    wikipedia: '백과사전', namuwiki: '나무위키', medical_journal: '의학 학술지', news: '언론·미디어', government: '정부기관',
  }
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle sub={`${authority.sources.filter(s => s.exists).length}개 확인 / ${authority.sources.length}개 점검`}>지식 소스 등재 현황</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {authority.sources.map((src, i) => (
            <div key={i} className={`bg-white rounded-lg border p-4 flex items-start gap-3 ${src.exists ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className={`mt-0.5 w-3 h-3 rounded-full shrink-0 ${src.exists ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-800 truncate">{src.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{sourceTypeLabel[src.type]}</p>
                {src.last_updated && <p className="text-sm text-slate-400">최근 업데이트: {src.last_updated}</p>}
              </div>
              <StatusBadge text={src.exists ? '등재' : '미등재'} variant={src.exists ? 'green' : 'gray'} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="인용 수 (2025)" value={authority.citation_count_2025} unit="건" sub="학술·미디어 인용" />
        <MetricCard label="인용 수 (2026)" value={authority.citation_count_2026} unit="건"
          sub={`${authority.citation_growth_pct > 0 ? '+' : ''}${authority.citation_growth_pct.toFixed(1)}% YoY`}
          accent={authority.citation_growth_pct > 0 ? '#059669' : '#DC2626'} />
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">도메인 권위 (DA)</p>
          <div className="flex items-center gap-4">
            <ScoreRing score={authority.domain_authority} size={72} color={getScoreColor(authority.domain_authority)} />
            <div>
              <StatusBadge text={authority.domain_authority >= 60 ? 'High' : authority.domain_authority >= 40 ? 'Medium' : 'Low'}
                variant={authority.domain_authority >= 60 ? 'green' : authority.domain_authority >= 40 ? 'blue' : 'gray'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: AI 벤치마크 ───────────────────────────────────────────────────────

type SampleQuery = { query: string; mentioned: boolean; rank?: number }

function AiBenchmarkTab({ aeo }: { aeo: AeoBenchmark }) {
  const [queries, setQueries] = useState<SampleQuery[]>(() => aeo.sample_queries.map(q => ({ ...q })))
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')

  function startEdit(idx: number) { setEditingIdx(idx); setEditText(queries[idx].query) }
  function confirmEdit(idx: number) {
    const t = editText.trim()
    if (!t) return
    setQueries(q => q.map((item, i) => i === idx ? { ...item, query: t } : item))
    setEditingIdx(null)
  }
  function deleteQuery(idx: number) { setQueries(q => q.filter((_, i) => i !== idx)); if (editingIdx === idx) setEditingIdx(null) }
  function addQuery() {
    const t = newText.trim()
    if (!t) return
    setQueries(q => [...q, { query: t, mentioned: false }])
    setNewText(''); setIsAdding(false)
  }

  const platformData = [
    { name: 'ChatGPT',    mentions: aeo.chatgpt_mentions },
    { name: 'Gemini',     mentions: aeo.gemini_mentions },
    { name: 'Claude',     mentions: aeo.claude_mentions },
    { name: 'Perplexity', mentions: aeo.perplexity_mentions },
  ]

  return (
    <div className="space-y-6">
      {/* Platform bar chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <SectionTitle sub="질문 10회당 언급 횟수 기준">AI 플랫폼별 노출 빈도</SectionTitle>
        <div className="h-52">
          <ResponsiveContainer width="100%" height={208}>
            <BarChart data={platformData} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 15, fill: '#374151', fontWeight: 600 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 13, fill: '#64748B' }} tickLine={false} axisLine={false} label={{ value: '/ 10 쿼리', angle: -90, position: 'insideLeft', offset: 14, style: { fontSize: 12, fill: '#94A3B8' } }} />
              <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v) => [`${v}회`, '노출 횟수']} />
              <Bar dataKey="mentions" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Google AI Overview</p>
          <StatusBadge text={aeo.google_sge_featured ? '노출됨' : '미노출'} variant={aeo.google_sge_featured ? 'green' : 'red'} />
        </div>
        <MetricCard label="평균 노출 순위" value={aeo.avg_rank.toFixed(1)} unit="위" />
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">AI 가시성 점수</p>
          <ScoreRing score={aeo.visibility_score} size={72} color={getScoreColor(aeo.visibility_score)} />
        </div>
      </div>

      {/* Editable query list */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
          <div className="flex items-baseline gap-4">
            <h3 className="text-base font-bold text-slate-700 uppercase tracking-[0.12em]">쿼리별 노출 현황</h3>
            <span className="text-sm text-slate-400">{queries.length}개 측정 쿼리</span>
          </div>
          <button onClick={() => { setIsAdding(true); setNewText('') }}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            쿼리 추가
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-500 px-5 py-3 w-8">#</th>
                <th className="text-left text-sm font-semibold text-slate-500 px-5 py-3">측정 쿼리</th>
                <th className="text-center text-sm font-semibold text-slate-500 px-4 py-3 w-28">노출 여부</th>
                <th className="text-center text-sm font-semibold text-slate-500 px-4 py-3 w-24">순위</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {queries.map((q, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-sm text-slate-400 font-medium">{i + 1}</td>
                  <td className="px-5 py-3">
                    {editingIdx === i ? (
                      <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(i); if (e.key === 'Escape') setEditingIdx(null) }}
                        className="w-full text-base border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    ) : (
                      <span className="text-base text-slate-700">{q.query}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge text={q.mentioned ? '노출' : '미노출'} variant={q.mentioned ? 'green' : 'gray'} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-base font-bold ${q.mentioned ? 'text-slate-800' : 'text-slate-300'}`}>
                      {q.mentioned && q.rank ? `${q.rank}위` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editingIdx === i ? (
                        <>
                          <button onClick={() => confirmEdit(i)} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 rounded">저장</button>
                          <button onClick={() => setEditingIdx(null)} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-2 py-1 bg-slate-100 rounded">취소</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(i)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => deleteQuery(i)} className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {isAdding && (
                <tr className="bg-blue-50/50">
                  <td className="px-5 py-3 text-sm text-slate-400">{queries.length + 1}</td>
                  <td className="px-5 py-3">
                    <input autoFocus value={newText} onChange={(e) => setNewText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addQuery(); if (e.key === 'Escape') setIsAdding(false) }}
                      placeholder="새 측정 쿼리 입력 후 Enter"
                      className="w-full text-base border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                  </td>
                  <td colSpan={3} className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={addQuery} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg">추가</button>
                      <button onClick={() => setIsAdding(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 bg-slate-100 rounded-lg">취소</button>
                    </div>
                  </td>
                </tr>
              )}
              {queries.length === 0 && !isAdding && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-base text-slate-400">등록된 측정 쿼리가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-400 mt-2">점검 일자: {aeo.checked_at}</p>
      </div>
    </div>
  )
}

// ─── Score Trend Chart ────────────────────────────────────────────────────────

interface ScoreTrendSnapshot {
  snapshot_date:   string
  geo_score:       number
  tech_score:      number
  authority_score: number
  aeo_score:       number
  community_score: number
  media_score:     number
}

function ScoreTrendChart({ brandId, brandColor }: { brandId: string; brandColor: string }) {
  const [data, setData]       = useState<ScoreTrendSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`/api/geo/trends?brandId=${brandId}`)
      .then(r => r.ok ? r.json() : r.json().then((b: { error?: string }) => Promise.reject(b.error ?? 'API 오류')))
      .then((d: { snapshots: ScoreTrendSnapshot[] }) => setData(d.snapshots))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [brandId])

  if (loading) return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-center gap-3 text-slate-400">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
      <span className="text-sm">트렌드 데이터 로딩 중…</span>
    </div>
  )

  if (error) return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 text-sm text-red-600">트렌드 로드 오류: {error}</div>
  )

  if (!data.length) return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">30일 GEO 점수 추이</p>
      <div className="flex items-center gap-3 py-6 text-slate-400">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-sm">아직 수집된 트렌드 데이터가 없습니다. Vercel Cron 첫 실행 후 차트가 표시됩니다.</p>
      </div>
    </div>
  )

  const chartData = data.map(d => ({
    date:  d.snapshot_date.slice(5), // "MM-DD"
    score: d.geo_score,
    tech:  d.tech_score,
    aeo:   d.aeo_score,
  }))
  const avg = Math.round(data.reduce((s, d) => s + d.geo_score, 0) / data.length)

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-baseline gap-4 pb-3 border-b border-slate-200 mb-5">
        <h3 className="text-base font-bold text-slate-700 uppercase tracking-[0.12em]">30일 GEO 점수 추이</h3>
        <span className="text-sm text-slate-400">평균 {avg}점</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height={192}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={28} />
            <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E2E8F0' }}
              formatter={(v) => [`${v}점`, 'GEO 종합']} />
            <ReferenceLine y={avg} stroke="#E2E8F0" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="score" stroke={brandColor} strokeWidth={2.5} dot={{ r: 3, fill: brandColor }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Naver Content Feed ───────────────────────────────────────────────────────

interface NaverContentItem {
  id:           string
  source_type:  'naver_blog' | 'naver_news'
  title:        string
  url:          string
  description:  string | null
  author:       string | null
  published_at: string | null
  refreshed_at: string
}

function NaverContentFeed({ brandId, sourceType, label }: {
  brandId:    string
  sourceType: 'naver_blog' | 'naver_news'
  label:      string
}) {
  const [items, setItems]     = useState<NaverContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const prevId                = useRef('')

  useEffect(() => {
    if (!brandId || prevId.current === `${brandId}:${sourceType}`) return
    prevId.current = `${brandId}:${sourceType}`
    setLoading(true); setError(null)
    fetch(`/api/geo/community?brandId=${brandId}&sourceType=${sourceType}`)
      .then(r => r.ok ? r.json() : r.json().then((b: { error?: string }) => Promise.reject(b.error ?? 'API 오류')))
      .then((d: { items: NaverContentItem[] }) => setItems(d.items))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [brandId, sourceType])

  const srcLabel: Record<string, string> = { naver_blog: '네이버 블로그', naver_news: '네이버 뉴스' }
  const srcColor: Record<string, string> = { naver_blog: 'bg-green-50 text-green-700 border-green-300', naver_news: 'bg-blue-50 text-blue-700 border-blue-300' }

  if (loading) return (
    <div className="flex items-center gap-3 py-6 text-slate-400">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
      <span className="text-sm">{label} 로딩 중…</span>
    </div>
  )

  if (error) return <div className="py-3 text-sm text-red-600 bg-red-50 rounded-lg px-4">오류: {error}</div>

  if (!items.length) return (
    <div className="flex items-center gap-3 py-6 text-slate-400 bg-slate-50 rounded-lg px-5">
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p className="text-sm">데이터 수집 중입니다. Vercel Cron 첫 실행(매일 03:00 KST) 후 콘텐츠가 표시됩니다.</p>
    </div>
  )

  const refreshed = items[0]?.refreshed_at
    ? new Date(items[0].refreshed_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' })
    : null

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
          className="group block bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-400 transition-colors">
          <div className="flex items-start gap-3">
            <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${srcColor[item.source_type]}`}>
              {srcLabel[item.source_type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-blue-700 group-hover:underline leading-snug line-clamp-2">{item.title}</p>
              {item.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {item.author && <span className="text-xs text-slate-400">{item.author}</span>}
                {item.published_at && <span className="text-xs text-slate-400">{item.published_at}</span>}
              </div>
            </div>
          </div>
        </a>
      ))}
      {refreshed && (
        <p className="text-xs text-slate-300 text-right">최근 갱신: {refreshed}</p>
      )}
    </div>
  )
}

// ─── YouTube Feed ─────────────────────────────────────────────────────────────

function YouTubeFeed({ youtubeQuery }: { youtubeQuery: string }) {
  const [videos, setVideos]   = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const prevQuery             = useRef('')

  useEffect(() => {
    if (!youtubeQuery || prevQuery.current === youtubeQuery) return
    prevQuery.current = youtubeQuery
    setLoading(true); setError(null)
    fetch(`/api/geo/youtube?q=${encodeURIComponent(youtubeQuery)}`)
      .then(r => r.ok ? r.json() : r.json().then((b: { error?: string }) => Promise.reject(b.error ?? 'API 오류')))
      .then((d: { videos: YouTubeVideo[] }) => setVideos(d.videos))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [youtubeQuery])

  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-slate-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span className="text-base">YouTube 최신 영상 로딩 중…</span>
    </div>
  )

  if (error) return (
    <div className="py-4 text-sm text-red-600 bg-red-50 rounded-lg px-4">YouTube API 오류: {error}</div>
  )

  if (!videos.length) return (
    <div className="py-4 text-sm text-slate-400">관련 영상을 찾을 수 없습니다.</div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((v) => {
        const viewK = v.view_count ? `${Math.floor(Number(v.view_count) / 1000).toLocaleString()}K 회` : null
        const date  = new Date(v.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
        return (
          <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
            className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-400 transition-colors">
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{v.title}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 truncate max-w-[60%]">{v.channel_title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {viewK && <span className="text-xs text-slate-400">{viewK}</span>}
                  <span className="text-xs text-slate-300">{date}</span>
                </div>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

// ─── Tab 4: 커뮤니티 ─────────────────────────────────────────────────────────

function CommunityTab({ community, youtubeQuery, brandId }: { community: Community; youtubeQuery: string; brandId: string }) {
  const platformData = [
    { name: '바비톡',   count: community.babytalk_monthly },
    { name: '강남언니', count: community.gangnam_unni_monthly },
    { name: '블로그',   count: community.blog_monthly },
    { name: '유튜브',   count: community.youtube_monthly },
  ]

  const sentimentData = [
    { name: '긍정', value: community.sentiment_positive_pct, fill: '#10B981' },
    { name: '부정/중립', value: 100 - community.sentiment_positive_pct, fill: '#E5E7EB' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Platform bar chart */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5">
          <SectionTitle sub="월간 언급량 기준">플랫폼별 언급 현황</SectionTitle>
          <div className="h-52">
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={platformData} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 15, fill: '#374151', fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString()} />
                <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #E2E8F0' }} formatter={(v) => [`${Number(v).toLocaleString()}건`, '월간 언급']} />
                <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment donut */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5">
          <SectionTitle>긍정 감성 비율</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="relative h-44 flex-1">
              <ResponsiveContainer width="100%" height={176}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={52} outerRadius={72}
                    startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                    {sentimentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">{community.sentiment_positive_pct}%</span>
                <span className="text-sm text-slate-500">긍정</span>
              </div>
            </div>
            <div className="space-y-2">
              {sentimentData.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.fill }} />
                  <span className="text-sm text-slate-600">{s.name}</span>
                  <span className="text-sm font-bold text-slate-800 ml-1">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard label="Share of Voice" value={`${community.share_of_voice_pct}%`} sub="커뮤니티 시장 점유율" />
        <MetricCard label="총 월간 언급" value={community.total_monthly_mentions.toLocaleString()} unit="건/월" />
      </div>

      <div>
        <SectionTitle>트렌딩 키워드</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {community.trending_keywords.map((kw, i) => (
            <span key={i} className="text-sm font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-default transition-colors">
              #{kw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle sub="네이버 블로그 — 최신 게시물">커뮤니티 블로그 콘텐츠</SectionTitle>
        <NaverContentFeed brandId={brandId} sourceType="naver_blog" label="블로그 게시물" />
      </div>

      <div>
        <SectionTitle sub={`"${youtubeQuery}" 최신 영상`}>YouTube 관련 콘텐츠</SectionTitle>
        <YouTubeFeed youtubeQuery={youtubeQuery} />
      </div>
    </div>
  )
}

// ─── Tab 5: 미디어 ────────────────────────────────────────────────────────────

function EarnedMediaTab({ media, brandId }: { media: EarnedMedia; brandId: string }) {
  const pressData = [
    { name: '2025', press: media.press_releases_2025, papers: media.academic_papers_2025 },
    { name: '2026', press: media.press_releases_2026, papers: media.academic_papers_2026 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grouped bar chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <SectionTitle>보도자료 · 학술논문 추이</SectionTitle>
          <div className="h-52">
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={pressData} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 15, fill: '#374151', fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend wrapperStyle={{ fontSize: 14 }} />
                <Bar name="보도자료" dataKey="press" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar name="학술논문" dataKey="papers" fill="#9CA3AF" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 content-start">
          <MetricCard label="세미나 발표" value={media.seminar_talks} unit="건" sub="2025~2026 합산" />
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">인용 성장률</p>
            <p className={`text-3xl font-bold ${media.citation_growth_pct > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {media.citation_growth_pct > 0 ? '+' : ''}{media.citation_growth_pct.toFixed(1)}%
            </p>
            <p className="text-sm text-slate-400 mt-1">YoY 성장</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5 col-span-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">미디어 점수</p>
            <ScoreRing score={media.media_score} size={64} color={getScoreColor(media.media_score)} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle sub="네이버 뉴스 — 최신 보도">최신 보도자료 & 뉴스</SectionTitle>
        <NaverContentFeed brandId={brandId} sourceType="naver_news" label="뉴스 기사" />
      </div>

      {media.notable_citations.length > 0 && (
        <div>
          <SectionTitle sub={`${media.notable_citations.length}건`}>주요 학술 인용</SectionTitle>
          <div className="space-y-3">
            {media.notable_citations.map((c, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-4">
                <span className="text-base font-bold text-slate-400 w-6 shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  {c.url
                    ? <a href={c.url} target="_blank" rel="noopener noreferrer"
                        className="text-base font-semibold text-blue-700 hover:underline leading-snug">{c.title}</a>
                    : <p className="text-base font-semibold text-slate-800 leading-snug">{c.title}</p>
                  }
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge text={c.journal} variant="blue" />
                    <span className="text-sm text-slate-500">{c.year}</span>
                    {c.impact_factor && <span className="text-sm text-slate-500">IF {c.impact_factor}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GEO Playground ──────────────────────────────────────────────────────────

const HISTORY_KEY  = 'geo_playground_history'
const HISTORY_MAX  = 20

type HistoryEntry = PlaygroundResult & { id: string }

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)))
}

function GeoPlayground() {
  const [history, setHistory]         = useState<HistoryEntry[]>([])
  const [activeIdx, setActiveIdx]     = useState<number | null>(null)
  const [query, setQuery]             = useState('')
  const [perspective, setPerspective] = useState('general')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  async function runPlayground() {
    if (!query.trim() || loading) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/geo/playground', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), perspective }),
      })
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error ?? `HTTP ${res.status}`) }
      const data = (await res.json()) as PlaygroundResult
      const entry: HistoryEntry = { ...data, id: crypto.randomUUID() }
      const updated = [entry, ...history].slice(0, HISTORY_MAX)
      setHistory(updated)
      saveHistory(updated)
      setActiveIdx(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 실패')
    } finally { setLoading(false) }
  }

  function deleteEntry(idx: number, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = history.filter((_, i) => i !== idx)
    setHistory(updated)
    saveHistory(updated)
    if (activeIdx === null) return
    if (activeIdx === idx) {
      setActiveIdx(updated.length === 0 ? null : Math.min(idx, updated.length - 1))
    } else if (activeIdx > idx) {
      setActiveIdx(activeIdx - 1)
    }
  }

  function clearAll() {
    setHistory([])
    saveHistory([])
    setActiveIdx(null)
  }

  const prominenceCls: Record<string, string> = { primary: 'bg-emerald-600', secondary: 'bg-amber-500', not_mentioned: 'bg-slate-200' }
  const prominenceLabel: Record<string, string> = { primary: '1순위 노출', secondary: '부차적 언급', not_mentioned: '미노출' }

  const activeEntry = activeIdx !== null ? history[activeIdx] : null

  return (
    <div className="space-y-6">
      {/* 히스토리 탭 행 */}
      <div className="flex items-center gap-0 border-b border-slate-200 overflow-x-auto">
        {/* 새 시뮬레이션 탭 */}
        <button
          onClick={() => setActiveIdx(null)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
            activeIdx === null
              ? 'text-slate-900 border-slate-900'
              : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-base leading-none">+</span>
          새 시뮬레이션
        </button>

        {/* 히스토리 탭 목록 */}
        {history.map((entry, i) => (
          <button
            key={entry.id}
            onClick={() => setActiveIdx(i)}
            className={`group flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
              activeIdx === i
                ? 'text-slate-900 border-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="max-w-[140px] truncate">
              {entry.query.length > 20 ? entry.query.slice(0, 20) + '…' : entry.query}
            </span>
            <span
              onClick={(e) => deleteEntry(i, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 leading-none text-base"
              role="button"
              aria-label={`${entry.query} 삭제`}
            >
              ×
            </span>
          </button>
        ))}

        {/* 전체 초기화 — 히스토리가 있을 때만 표시 */}
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto shrink-0 px-3 py-2.5 text-xs text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap"
          >
            전체 초기화
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <p className="text-base font-bold text-slate-800 mb-1">AI 시뮬레이션 분석 도구</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          소비자 또는 의사가 AI에게 질문할 때 볼뉴머가 어떻게 노출되는지 시뮬레이션합니다.
          ChatGPT 스타일과 Gemini/Perplexity 스타일의 답변을 비교하고 6개 브랜드의 AI 가시성을 분석합니다.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-600 mb-1.5 block">질문 입력</label>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runPlayground()}
              placeholder="예: 리프팅 시술 추천해줘, 모노폴라 RF 뭐가 좋아?"
              className="w-full text-base border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" />
          </div>
          <div className="sm:w-48">
            <label className="text-sm font-semibold text-slate-600 mb-1.5 block">질문자 페르소나</label>
            <select value={perspective} onChange={(e) => setPerspective(e.target.value)}
              className="w-full text-base border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
              {PERSPECTIVES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-sm text-slate-400 mb-2">예시 질문</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((q) => (
              <button key={q} onClick={() => setQuery(q)}
                className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">{q}</button>
            ))}
          </div>
        </div>

        <button onClick={runPlayground} disabled={!query.trim() || loading}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-base font-semibold rounded-lg disabled:opacity-50 transition-colors">
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>분석 중…</>
            : <>시뮬레이션 실행</>
          }
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-base rounded-lg px-4 py-3">
          <span className="flex-1">{error}</span>
          <button onClick={runPlayground} className="text-sm underline shrink-0">재시도</button>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold">실제 API 응답</span> — ChatGPT(GPT-4o), Gemini(1.5 Pro), Claude(Sonnet) 3개 모델에 동일 질문을 입력한 실제 결과입니다.
              브랜드 가시성 분석은 Claude가 3개 답변을 종합 처리합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[result.model_chatgpt, result.model_gemini, result.model_claude].map((model, i) => {
              const badges = [
                { label: 'OpenAI', cls: 'bg-green-50 text-green-700 border-green-300' },
                { label: 'Google', cls: 'bg-blue-50 text-blue-700 border-blue-300' },
                { label: 'Anthropic', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
              ]
              return (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badges[i].cls}`}>{badges[i].label}</span>
                    <span className="text-base font-bold text-slate-700">{model.name}</span>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{model.answer}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-base font-bold text-slate-700 mb-5">6개 브랜드 AI 노출 가시성</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {result.brand_visibility.map((bv) => {
                const isOurs = bv.brand === '볼뉴머'
                return (
                  <div key={bv.brand} className={`flex flex-col items-center gap-2 rounded-lg p-3 ${isOurs ? 'bg-red-50 ring-2 ring-red-200' : 'bg-slate-50'}`}>
                    {isOurs && <span className="text-xs font-bold text-red-600 uppercase tracking-wide">당사</span>}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${prominenceCls[bv.prominence]}`}>
                      {bv.rank
                        ? <span className="text-white text-base font-bold">{bv.rank}</span>
                        : <span className="text-slate-400 text-base font-bold">—</span>
                      }
                    </div>
                    <span className={`text-sm font-semibold text-center ${isOurs ? 'text-red-700' : 'text-slate-700'}`}>{bv.brand}</span>
                    <span className="text-xs text-slate-400 text-center leading-tight">{prominenceLabel[bv.prominence]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-base font-bold text-slate-700 mb-4">GEO 분석 인사이트</p>
            <div className="space-y-4">
              {result.geo_insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <span className="text-base font-bold text-slate-400 shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-base text-slate-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main GeoClient ───────────────────────────────────────────────────────────

const ANALYSIS_TABS = ['Tech·AEO', '지식소스', 'AI 벤치마크', '커뮤니티', '미디어'] as const
const PAGE_VIEWS    = ['Overview', '브랜드 분석', 'GEO Playground'] as const
type PageView = typeof PAGE_VIEWS[number]

export default function GeoClient() {
  const [activeView, setActiveView]       = useState<PageView>('Overview')
  const [selectedBrandIdx, setSelectedBrandIdx] = useState(0)
  const [activeTab, setActiveTab]         = useState(0)
  const [pdfLoading, setPdfLoading]       = useState(false)

  const brand = GEO_DATA[selectedBrandIdx]

  async function exportPDF() {
    const el = document.getElementById('geo-pdf-target')
    if (!el) return
    setPdfLoading(true)
    try {
      const dataUrl  = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 1.5 })
      const pdf      = new jsPDF({ unit: 'mm', format: 'a4' })
      const margin   = 10
      const pageW    = pdf.internal.pageSize.getWidth()
      const pageH    = pdf.internal.pageSize.getHeight()
      const imgW     = pageW - margin * 2
      const img      = new window.Image()
      img.src        = dataUrl
      await new Promise<void>(res => { img.onload = () => res() })
      const imgH     = (img.naturalHeight / img.naturalWidth) * imgW
      const contentH = pageH - margin * 2

      const totalPages = Math.ceil(imgH / contentH)
      for (let p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', margin, margin - p * contentH, imgW, imgH)
        // 넘침 영역 흰색으로 덮기
        pdf.setFillColor(255, 255, 255)
        if (p > 0) pdf.rect(0, 0, pageW, margin, 'F')
        if (p < totalPages - 1) pdf.rect(0, pageH - margin, pageW, margin * 2, 'F')
      }

      const dateStr = new Date().toISOString().split('T')[0]
      pdf.save(`GEO_분석_${brand.name}_${dateStr}.pdf`)
    } catch (err) {
      console.error('[GEO] PDF export error:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div id="geo-pdf-target" className="max-w-6xl mx-auto px-5 py-7 space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GEO / AEO 경쟁 인텔리전스</h1>
          <p className="text-base text-slate-500 mt-1.5">볼뉴머 vs 경쟁 {GEO_DATA.length - 1}개 브랜드 · 2026 AI 검색 최적화 현황 분석</p>
        </div>
        {activeView === '브랜드 분석' && (
          <button onClick={exportPDF} disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 print:hidden">
            {pdfLoading
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>생성 중…</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>PDF 저장</>
            }
          </button>
        )}
      </div>

      {/* Page View Tabs */}
      <div className="flex gap-0 border-b border-slate-200 print:hidden">
        {PAGE_VIEWS.map((view) => (
          <button key={view} onClick={() => setActiveView(view)}
            className={`px-6 py-3 text-base font-semibold border-b-2 transition-all ${
              activeView === view
                ? 'text-slate-900 border-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
            }`}>
            {view}
          </button>
        ))}
      </div>

      {/* ── Overview ────────────────────────────────────────────────────────── */}
      {activeView === 'Overview' && <OverviewTab />}

      {/* ── 브랜드 분석 ─────────────────────────────────────────────────────── */}
      {activeView === '브랜드 분석' && (
        <>
          {/* Brand selector */}
          <div className="flex gap-2 flex-wrap">
            {GEO_DATA.map((b, i) => (
              <button key={b.id} onClick={() => { setSelectedBrandIdx(i); setActiveTab(0) }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-semibold border-2 transition-all ${
                  selectedBrandIdx === i ? 'text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
                style={selectedBrandIdx === i ? { backgroundColor: b.color, borderColor: b.color } : {}}>
                {b.id === 'volnewmer' && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${selectedBrandIdx === i ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>당사</span>
                )}
                <span>{b.name}</span>
                <span className={`text-sm px-1.5 py-0.5 rounded font-bold ${selectedBrandIdx === i ? 'bg-white/20 text-white' : 'bg-slate-100'}`}
                  style={selectedBrandIdx !== i ? { color: b.color } : {}}>
                  {b.geo_score}
                </span>
              </button>
            ))}
          </div>

          <ScoreOverview brand={brand} />

          <ScoreTrendChart brandId={brand.id} brandColor={brand.color} />

          {/* Analysis tabs */}
          <div>
            <div className="flex gap-0 border-b border-slate-200 mb-6 overflow-x-auto print:hidden">
              {ANALYSIS_TABS.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)}
                  className={`px-5 py-3 text-base font-semibold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === i ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <div>
              {activeTab === 0 && <TechAeoTab tech={brand.tech} />}
              {activeTab === 1 && <AuthorityTab authority={brand.authority} />}
              {activeTab === 2 && <AiBenchmarkTab key={brand.id} aeo={brand.aeo} />}
              {activeTab === 3 && <CommunityTab community={brand.community} youtubeQuery={brand.youtube_query} brandId={brand.id} />}
              {activeTab === 4 && <EarnedMediaTab media={brand.earned_media} brandId={brand.id} />}
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-6 pt-6 pb-1">
              <SectionTitle sub={`${GEO_DATA.length}개 브랜드 종합`}>{GEO_DATA.length}개 브랜드 비교</SectionTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-sm font-semibold text-slate-500 px-6 py-3">브랜드</th>
                    <th className="text-center text-sm font-semibold text-slate-500 px-4 py-3">GEO 종합</th>
                    {DIMENSION_LABELS.map((d) => <th key={d.key} className="text-center text-sm font-semibold text-slate-500 px-4 py-3">{d.label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {GEO_DATA.map((b) => {
                    const idx = GEO_DATA.indexOf(b)
                    const isOurs = b.id === 'volnewmer'
                    const scores = [b.tech.eeeat_score, b.authority.authority_score, b.aeo.visibility_score, b.community.community_score, b.earned_media.media_score]
                    return (
                      <tr key={b.id} onClick={() => setSelectedBrandIdx(idx)}
                        className={`cursor-pointer transition-colors ${idx === selectedBrandIdx ? 'bg-slate-50' : isOurs ? 'bg-red-50/30 hover:bg-red-50' : 'hover:bg-slate-50/60'}`}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-slate-800">{b.name}</span>
                                {isOurs && <span className="text-xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">당사</span>}
                              </div>
                              <p className="text-sm text-slate-400">{b.name_en} · {b.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-base font-bold" style={{ color: b.color }}>{b.geo_score}</span>
                        </td>
                        {scores.map((s, si) => (
                          <td key={si} className="px-4 py-3 text-center">
                            <span className="text-sm font-semibold" style={{ color: getScoreColor(s) }}>{s}</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── GEO Playground ──────────────────────────────────────────────────── */}
      {activeView === 'GEO Playground' && <GeoPlayground />}
    </div>
  )
}
