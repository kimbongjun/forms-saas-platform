import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'
import type { FormField } from '@/types/database'

interface ResponsesPageProps {
  params: Promise<{ id: string }>
}

const INPUT_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select', 'radio', 'checkbox_group']

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const { id } = await params
  const supabase = createServerClient()

  const [{ data: project, error: projectErr }, { data: fields }, { data: submissions }] =
    await Promise.all([
      supabase.from('projects').select('id, title, slug').eq('id', id).single(),
      supabase
        .from('form_fields')
        .select('*')
        .eq('project_id', id)
        .order('order_index', { ascending: true }),
      supabase
        .from('submissions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false }),
    ])

  if (projectErr || !project) notFound()

  const inputFields: FormField[] = (fields ?? []).filter((f: FormField) =>
    INPUT_TYPES.includes(f.type)
  )
  const submissionList = submissions ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{project.title}</h1>
              <p className="text-xs text-gray-400">응답 목록 — 총 {submissionList.length}건</p>
            </div>
          </div>
          {submissionList.length > 0 && (
            <Link
              href={`/dashboard/${id}/responses/export`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              CSV 내보내기
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {submissionList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
            <p className="text-base font-medium text-gray-500">아직 응답이 없습니다</p>
            <p className="mt-1 text-sm text-gray-400">
              <Link href={`/${project.slug}`} target="_blank" className="text-blue-500 hover:underline">
                폼 링크
              </Link>
              를 공유하여 응답을 받아보세요.
            </p>
          </div>
        ) : inputFields.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            입력 필드가 없는 폼입니다.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                      제출 시각
                    </th>
                    {inputFields.map((f) => (
                      <th
                        key={f.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap max-w-[200px]"
                      >
                        <span className="block truncate">{f.label || '(제목 없음)'}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissionList.map((sub, idx) => {
                    const createdAt = new Date(sub.created_at).toLocaleString('ko-KR', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })
                    return (
                      <tr
                        key={sub.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          idx % 2 === 0 ? '' : 'bg-gray-50/40'
                        }`}
                      >
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {createdAt}
                        </td>
                        {inputFields.map((f) => {
                          const val = sub.answers?.[f.id]
                          let display = '—'
                          if (Array.isArray(val)) display = val.join(', ')
                          else if (typeof val === 'boolean') display = val ? '✅ 동의' : '❌ 미동의'
                          else if (val != null && val !== '') display = String(val)
                          return (
                            <td key={f.id} className="px-4 py-3 text-gray-700 max-w-[240px]">
                              <span className="block truncate">{display}</span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
