import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CalendarRange, DollarSign, ExternalLink, SquarePen, Users, FileText, MessageSquareText } from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'

interface ProjectOverviewPageProps {
  params: Promise<{ id: string }>
}

const CATEGORY_COLORS: Record<string, string> = {
  'PR': 'bg-blue-100 text-blue-700',
  '디지털 마케팅': 'bg-violet-100 text-violet-700',
  '바이럴': 'bg-pink-100 text-pink-700',
  'HCP 마케팅': 'bg-emerald-100 text-emerald-700',
  'B2B 마케팅': 'bg-amber-100 text-amber-700',
}

const ROLE_LABELS: Record<string, string> = {
  owner: '오너', manager: '매니저', member: '멤버', viewer: '뷰어',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d))
}

export default async function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [
    { data: project, error: projectError },
    { count: fieldCount },
    { count: submissionCount },
    { data: members },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, slug, is_published, category, start_date, end_date, budget, created_at')
      .eq('id', id)
      .single(),
    supabase.from('form_fields').select('*', { count: 'exact', head: true }).eq('project_id', id),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('project_id', id),
    supabase.from('project_members').select('*').eq('project_id', id).order('created_at', { ascending: true }),
  ])

  if (projectError || !project) notFound()

  const categoryColor = project.category
    ? (CATEGORY_COLORS[project.category] ?? 'bg-gray-100 text-gray-600')
    : null

  return (
    <div className="space-y-5">
      {/* 프로젝트 개요 카드 */}
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {project.category && (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                {project.category}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {(project.start_date || project.end_date) && (
                <div className="flex items-center gap-1.5">
                  <CalendarRange className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatDate(project.start_date) ?? '미정'}
                    {' — '}
                    {formatDate(project.end_date) ?? '미정'}
                  </span>
                </div>
              )}
              {project.budget != null && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{Number(project.budget).toLocaleString('ko-KR')}원</span>
                </div>
              )}
            </div>
          </div>

          {/* 바로가기 버튼 */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/projects/${id}/execution/forms`}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <SquarePen className="h-4 w-4" />
              신청폼 편집
            </Link>
            <Link
              href={`/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              공개 폼 보기
            </Link>
            <Link
              href={`/projects/${id}/execution/live-responses`}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <MessageSquareText className="h-4 w-4" />
              응답 보기
            </Link>
          </div>
        </div>

        {/* 퀵 통계 */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-4">
          {[
            { label: 'Form Fields', value: fieldCount ?? 0, icon: FileText },
            { label: 'Responses', value: submissionCount ?? 0, icon: MessageSquareText },
            { label: 'Team', value: members?.length ?? 0, icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Status</p>
            <p className="mt-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${project.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {project.is_published ? '공개' : '비공개'}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 팀 구성 */}
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">팀 구성 (R&amp;R)</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {members?.length ?? 0}명
          </span>
        </div>

        {!members || members.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <p className="text-sm text-gray-400">등록된 팀원이 없습니다.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  {member.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">{member.name}</p>
                    <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  </div>
                  {member.department && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">{member.department}</p>
                  )}
                  {member.email && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">{member.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
