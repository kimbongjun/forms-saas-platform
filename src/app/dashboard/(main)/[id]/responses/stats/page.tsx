import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'
import type { FormField } from '@/types/database'

interface StatsPageProps {
  params: Promise<{ id: string }>
}

const INPUT_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select', 'radio', 'checkbox_group', 'rating']
const CHOICE_TYPES = ['select', 'radio', 'checkbox_group']
const COLORS = ['#2563EB', '#16A34A', '#DC2626', '#9333EA', '#F59E0B', '#0891B2', '#EC4899', '#6B7280', '#D97706', '#065F46']

export default async function StatsPage({ params }: StatsPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: project }, { data: fields }, { data: allSubmissions }] = await Promise.all([
    supabase.from('projects').select('id, title').eq('id', id).single(),
    supabase.from('form_fields').select('*').eq('project_id', id).order('order_index'),
    supabase.from('submissions').select('answers').eq('project_id', id),
  ])

  if (!project) notFound()

  const inputFields: FormField[] = (fields ?? []).filter((f: FormField) => INPUT_TYPES.includes(f.type))
  const submissions = allSubmissions ?? []
  const total = submissions.length

  return (
    <div>
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link href={`/dashboard/${id}/responses`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-gray-900">{project.title}</h1>
            <p className="text-xs text-gray-400">상세 통계 — 총 {total}건</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 sm:px-6">
        {total === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
            <p className="text-sm text-gray-400">아직 응답이 없습니다.</p>
          </div>
        )}

        {inputFields.map((field) => {
          const answers = submissions.map((s) => (s.answers as Record<string, unknown>)?.[field.id])
          return (
            <FieldStats key={field.id} field={field} answers={answers} total={total} />
          )
        })}
      </div>
    </div>
  )
}

// ── 필드별 통계 컴포넌트 ──────────────────────────────────────────────────────

function FieldStats({ field, answers, total }: {
  field: FormField
  answers: unknown[]
  total: number
}) {
  const label = field.label.replace(/<[^>]*>/g, '').trim() || '(제목 없음)'
  const responded = answers.filter((a) => a !== undefined && a !== null && a !== '' && a !== false).length
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {responded}/{total}명 응답 ({responseRate}%)
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
          {field.type}
        </span>
      </div>

      {CHOICE_TYPES.includes(field.type) && (
        <ChoiceChart field={field} answers={answers} total={total} />
      )}
      {field.type === 'rating' && (
        <RatingChart field={field} answers={answers} total={responded} />
      )}
      {field.type === 'checkbox' && (
        <CheckboxChart answers={answers} total={total} />
      )}
      {['text', 'email', 'textarea'].includes(field.type) && (
        <TextAnswers answers={answers} />
      )}
    </section>
  )
}

// ── 선택형 차트 (Bar + Pie) ───────────────────────────────────────────────────

function ChoiceChart({ field, answers, total }: { field: FormField; answers: unknown[]; total: number }) {
  const counts: Record<string, number> = {}
  for (const a of answers) {
    if (Array.isArray(a)) {
      a.forEach((v) => { if (v) counts[v] = (counts[v] || 0) + 1 })
    } else if (typeof a === 'string' && a) {
      counts[a] = (counts[a] || 0) + 1
    }
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const maxCount = entries[0]?.[1] ?? 1
  const totalAnswers = entries.reduce((s, [, c]) => s + c, 0) || 1

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">응답 없음</p>
  }

  // Pie chart (SVG)
  const isPie = field.type === 'radio' || field.type === 'select'
  let cumAngle = 0
  const pieSlices = isPie ? entries.map(([, count], i) => {
    const pct = count / totalAnswers
    const start = cumAngle
    cumAngle += pct * 360
    return { pct, start, end: cumAngle, color: COLORS[i % COLORS.length] }
  }) : []

  return (
    <div className={isPie ? 'flex flex-col gap-4 sm:flex-row sm:items-start' : 'space-y-3'}>
      {isPie && (
        <div className="shrink-0 flex justify-center">
          <PieChart slices={pieSlices} />
        </div>
      )}
      <div className="flex-1 space-y-2.5">
        {entries.map(([opt, count], i) => {
          const pct = Math.round((count / totalAnswers) * 100)
          return (
            <div key={opt}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 truncate max-w-[200px] text-gray-700">
                  {isPie && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  )}
                  {opt}
                </span>
                <span className="ml-2 shrink-0 font-medium text-gray-600">{count}건 ({pct}%)</span>
              </div>
              {!isPie && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.round((count / maxCount) * 100)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PieChart({ slices }: { slices: { pct: number; start: number; end: number; color: string }[] }) {
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4

  function polarToXY(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  if (slices.length === 1) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill={slices[0].color} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => {
        const start = polarToXY(s.start)
        const end = polarToXY(s.end)
        const largeArc = s.end - s.start > 180 ? 1 : 0
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
            fill={s.color}
            stroke="white"
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

// ── 평점 차트 ─────────────────────────────────────────────────────────────────

function RatingChart({ field, answers, total }: { field: FormField; answers: unknown[]; total: number }) {
  const max = Number(field.content ?? 5)
  const nums = answers.map((a) => Number(a)).filter((n) => n > 0 && n <= max)
  const avg = nums.length > 0 ? (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(1) : '-'
  const dist: number[] = Array(max).fill(0)
  nums.forEach((n) => { dist[n - 1]++ })
  const maxCount = Math.max(...dist, 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-gray-900">{avg}</span>
        <span className="text-sm text-gray-400">/ {max}점 평균 ({total}명 응답)</span>
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: max }, (_, i) => {
          const count = dist[i]
          const pct = Math.round((count / maxCount) * 100)
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-6 shrink-0 text-right text-gray-500">{i + 1}점</span>
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 shrink-0 text-gray-500">{count}건</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 체크박스 ──────────────────────────────────────────────────────────────────

function CheckboxChart({ answers, total }: { answers: unknown[]; total: number }) {
  const yes = answers.filter(Boolean).length
  const no = total - yes
  const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0
  return (
    <div className="space-y-2">
      {[{ label: '동의', count: yes, color: '#16A34A' }, { label: '미동의', count: no, color: '#D1D5DB' }].map(({ label, count, color }) => (
        <div key={label}>
          <div className="mb-1 flex justify-between text-xs text-gray-600">
            <span>{label}</span>
            <span className="font-medium">{count}건 ({label === '동의' ? yesPct : 100 - yesPct}%)</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full transition-all" style={{ width: `${label === '동의' ? yesPct : 100 - yesPct}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 텍스트 응답 목록 ──────────────────────────────────────────────────────────

function TextAnswers({ answers }: { answers: unknown[] }) {
  const texts = answers.filter((a): a is string => typeof a === 'string' && a.trim() !== '')
  if (texts.length === 0) return <p className="text-xs text-gray-400">응답 없음</p>
  return (
    <ul className="max-h-48 overflow-y-auto space-y-1.5">
      {texts.map((t, i) => (
        <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">{t}</li>
      ))}
    </ul>
  )
}
