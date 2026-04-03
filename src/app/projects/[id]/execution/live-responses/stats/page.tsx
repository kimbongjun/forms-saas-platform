import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'
import type { FormField } from '@/types/database'

interface LiveResponsesStatsPageProps {
  params: Promise<{ id: string }>
}

const INPUT_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select', 'radio', 'checkbox_group', 'rating']
const CHOICE_TYPES = ['select', 'radio', 'checkbox_group']
const COLORS = ['#2563EB', '#16A34A', '#DC2626', '#9333EA', '#F59E0B', '#0891B2', '#EC4899', '#6B7280']

export default async function LiveResponsesStatsPage({ params }: LiveResponsesStatsPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: project }, { data: fields }, { data: allSubmissions }] = await Promise.all([
    supabase.from('projects').select('id, title').eq('id', id).single(),
    supabase.from('form_fields').select('*').eq('project_id', id).order('order_index'),
    supabase.from('submissions').select('answers').eq('project_id', id),
  ])

  if (!project) notFound()

  const inputFields: FormField[] = (fields ?? []).filter((field: FormField) => INPUT_TYPES.includes(field.type))
  const submissions = allSubmissions ?? []
  const total = submissions.length

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${id}/execution/live-responses`}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Execution / Live Responses / Stats</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{project.title}</h2>
            <p className="mt-1 text-sm text-gray-500">총 {total}건 기준의 상세 응답 통계입니다.</p>
          </div>
        </div>
      </section>

      {total === 0 && (
        <div className="rounded-[28px] border-2 border-dashed border-gray-200 bg-white py-24 text-center text-sm text-gray-400">
          아직 응답이 없습니다.
        </div>
      )}

      {inputFields.map((field) => {
        const answers = submissions.map((submission) => (submission.answers as Record<string, unknown>)?.[field.id])
        return <FieldStats key={field.id} field={field} answers={answers} total={total} />
      })}
    </div>
  )
}

function FieldStats({ field, answers, total }: { field: FormField; answers: unknown[]; total: number }) {
  const label = field.label.replace(/<[^>]*>/g, '').trim() || '(제목 없음)'
  const responded = answers.filter((answer) => answer !== undefined && answer !== null && answer !== '' && answer !== false).length
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {responded}/{total}명 응답 ({responseRate}%)
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">{field.type}</span>
      </div>

      {CHOICE_TYPES.includes(field.type) && <ChoiceChart field={field} answers={answers} />}
      {field.type === 'rating' && <RatingChart field={field} answers={answers} total={responded} />}
      {field.type === 'checkbox' && <CheckboxChart answers={answers} total={total} />}
      {['text', 'email', 'textarea'].includes(field.type) && <TextAnswers answers={answers} />}
    </section>
  )
}

function ChoiceChart({ field, answers }: { field: FormField; answers: unknown[] }) {
  const counts: Record<string, number> = {}

  for (const answer of answers) {
    if (Array.isArray(answer)) {
      answer.forEach((value) => {
        if (value) counts[String(value)] = (counts[String(value)] || 0) + 1
      })
    } else if (typeof answer === 'string' && answer) {
      counts[answer] = (counts[answer] || 0) + 1
    }
  }

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const maxCount = entries[0]?.[1] ?? 1
  const totalAnswers = entries.reduce((sum, [, count]) => sum + count, 0) || 1
  const isPie = field.type === 'radio' || field.type === 'select'
  let cumulativeAngle = 0

  const pieSlices = isPie
    ? entries.map(([, count], index) => {
        const ratio = count / totalAnswers
        const start = cumulativeAngle
        cumulativeAngle += ratio * 360

        return {
          start,
          end: cumulativeAngle,
          color: COLORS[index % COLORS.length],
        }
      })
    : []

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">응답 없음</p>
  }

  return (
    <div className={isPie ? 'flex flex-col gap-6 lg:flex-row lg:items-start' : 'space-y-3'}>
      {isPie && (
        <div className="shrink-0">
          <PieChart slices={pieSlices} />
        </div>
      )}

      <div className="flex-1 space-y-3">
        {entries.map(([option, count], index) => {
          const percentage = Math.round((count / totalAnswers) * 100)

          return (
            <div key={option}>
              <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2 truncate">
                  {isPie && (
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  )}
                  {option}
                </span>
                <span className="font-medium text-gray-900">
                  {count}건 ({percentage}%)
                </span>
              </div>

              {!isPie && (
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((count / maxCount) * 100)}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
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

function PieChart({ slices }: { slices: { start: number; end: number; color: string }[] }) {
  const size = 120
  const center = size / 2
  const radius = center - 4

  function polarToXY(angle: number) {
    const radians = ((angle - 90) * Math.PI) / 180
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    }
  }

  if (slices.length === 1) {
    return (
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} fill={slices[0].color} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size}>
      {slices.map((slice, index) => {
        const start = polarToXY(slice.start)
        const end = polarToXY(slice.end)
        const largeArc = slice.end - slice.start > 180 ? 1 : 0

        return (
          <path
            key={index}
            d={`M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
            fill={slice.color}
            stroke="white"
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

function RatingChart({ field, answers, total }: { field: FormField; answers: unknown[]; total: number }) {
  const max = Number(field.content ?? 5)
  const scores = answers.map((answer) => Number(answer)).filter((score) => score > 0 && score <= max)
  const average = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : '-'
  const distribution = Array(max).fill(0)
  scores.forEach((score) => { distribution[score - 1] += 1 })
  const maxCount = Math.max(...distribution, 1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-semibold text-gray-900">{average}</span>
        <span className="text-sm text-gray-400">/ {max}점 평균 ({total}명 응답)</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: max }, (_, index) => {
          const count = distribution[index]

          return (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-right text-gray-500">{index + 1}점</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                />
              </div>
              <span className="w-12 text-gray-500">{count}건</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CheckboxChart({ answers, total }: { answers: unknown[]; total: number }) {
  const yes = answers.filter(Boolean).length
  const no = total - yes
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0

  return (
    <div className="space-y-3">
      {[
        { label: '동의', count: yes, ratio: yesPercent, color: '#16A34A' },
        { label: '미동의', count: no, ratio: 100 - yesPercent, color: '#D1D5DB' },
      ].map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
            <span>{item.label}</span>
            <span className="font-medium text-gray-900">
              {item.count}건 ({item.ratio}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${item.ratio}%`, backgroundColor: item.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TextAnswers({ answers }: { answers: unknown[] }) {
  const texts = answers.filter((answer): answer is string => typeof answer === 'string' && answer.trim() !== '')

  if (texts.length === 0) {
    return <p className="text-sm text-gray-400">응답 없음</p>
  }

  return (
    <ul className="max-h-56 space-y-2 overflow-y-auto">
      {texts.map((text, index) => (
        <li key={index} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {text}
        </li>
      ))}
    </ul>
  )
}
