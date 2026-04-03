import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2, Download } from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'
import ResponsesTable from '@/components/dashboard/ResponsesTable'
import type { FormField } from '@/types/database'

interface LiveResponsesPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

const INPUT_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select', 'radio', 'checkbox_group']
const PAGE_SIZE = 20

function formatSubmissionDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))
}

export default async function LiveResponsesPage({ params, searchParams }: LiveResponsesPageProps) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams])
  const supabase = await createServerClient()

  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  const [
    { data: project, error: projectError },
    { data: fields },
    { count: totalCount },
    { data: submissions },
  ] = await Promise.all([
    supabase.from('projects').select('id, title, slug').eq('id', id).single(),
    supabase.from('form_fields').select('*').eq('project_id', id).order('order_index', { ascending: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('project_id', id),
    supabase.from('submissions').select('*').eq('project_id', id).order('created_at', { ascending: false }).range(start, end),
  ])

  if (projectError || !project) notFound()

  const inputFields: FormField[] = (fields ?? []).filter((field: FormField) => INPUT_TYPES.includes(field.type))
  const total = totalCount ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const statFields = inputFields.filter((field) => ['select', 'radio', 'checkbox_group'].includes(field.type))

  let allAnswers: { answers: Record<string, unknown> }[] = []
  if (statFields.length > 0) {
    const { data } = await supabase.from('submissions').select('answers').eq('project_id', id)
    allAnswers = data ?? []
  }

  const stats: Record<string, Record<string, number>> = {}
  for (const field of statFields) {
    stats[field.id] = {}
    for (const row of allAnswers) {
      const value = row.answers?.[field.id]
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item) stats[field.id][String(item)] = (stats[field.id][String(item)] || 0) + 1
        })
      } else if (typeof value === 'string' && value) {
        stats[field.id][value] = (stats[field.id][value] || 0) + 1
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${id}`}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Execution / Live Responses</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">{project.title}</h2>
              <p className="mt-1 text-sm text-gray-500">총 {total}건의 응답이 수집되었습니다.</p>
            </div>
          </div>

          {total > 0 && (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/projects/${id}/execution/live-responses/stats`}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <BarChart2 className="h-4 w-4" />
                상세 통계
              </Link>
              <Link
                href={`/projects/${id}/execution/live-responses/export`}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                CSV 내보내기
              </Link>
            </div>
          )}
        </div>
      </section>

      {statFields.length > 0 && total > 0 && (
        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">주요 선택형 응답 통계</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {statFields.map((field) => {
              const fieldStats = stats[field.id] ?? {}
              const entries = Object.entries(fieldStats).sort((a, b) => b[1] - a[1])
              const maxCount = entries[0]?.[1] ?? 1

              return (
                <div key={field.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-800">{field.label || '(제목 없음)'}</p>
                  <div className="mt-4 space-y-3">
                    {entries.length === 0 ? (
                      <p className="text-xs text-gray-400">응답 없음</p>
                    ) : entries.map(([option, count]) => (
                      <div key={option}>
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                          <span className="truncate max-w-[180px]">{option}</span>
                          <span className="ml-2 shrink-0 font-medium">
                            {count}건 ({Math.round((count / total) * 100)}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-gray-900"
                            style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-24 text-center">
            <p className="text-base font-medium text-gray-500">아직 응답이 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">
              <Link href={`/${project.slug}`} target="_blank" className="text-blue-500 hover:underline">
                공개 폼
              </Link>
              을 공유해 응답을 수집해 보세요.
            </p>
          </div>
        ) : inputFields.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400">
            입력형 필드가 없어 응답 테이블을 구성할 수 없습니다.
          </div>
        ) : (
          <ResponsesTable
            submissions={(submissions ?? []).map((submission) => ({
              ...submission,
              created_at_label: formatSubmissionDate(submission.created_at),
            }))}
            inputFields={inputFields}
            page={page}
            totalPages={totalPages}
          />
        )}
      </section>
    </div>
  )
}
