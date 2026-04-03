import Link from 'next/link'
import { createServerClient } from '@/utils/supabase/server'
import WorkspacePage from '@/components/workspace/WorkspacePage'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: totalFields },
    { count: totalSubmissions },
    { data: recentProjects },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('form_fields').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('id, title, created_at, is_published')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  return (
    <WorkspacePage
      eyebrow="Dashboard"
      title="마케팅 프로젝트 Overview"
      description="현재 진행중인 프로젝트 관련 주요 지표를 확인할 수 있습니다."
      actions={[
        { href: '/projects/new', label: '신규 프로젝트 생성' },
        { href: '/projects', label: '프로젝트 목록', variant: 'secondary' },
      ]}
      stats={[
        { label: 'Projects', value: String(totalProjects ?? 0), helper: '전체 프로젝트 수' },
        { label: 'Published', value: String(publishedProjects ?? 0), helper: '공개 상태 프로젝트' },
        { label: 'Form Fields', value: String(totalFields ?? 0), helper: '누적 폼 필드 수' },
        { label: 'Responses', value: String(totalSubmissions ?? 0), helper: '누적 응답 수' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">최근 프로젝트</h2>
              <p className="mt-1 text-sm text-gray-500">최근 생성된 워크스페이스를 바로 열 수 있습니다.</p>
            </div>
            <Link href="/projects" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
              전체 보기
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(recentProjects ?? []).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Seoul',
                    }).format(new Date(project.created_at))}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  project.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {project.is_published ? '공개' : '비공개'}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">허브 진입</h2>
          <div className="mt-5 space-y-3">
            <Link href="/dashboard/kpi" className="block rounded-2xl bg-gray-50 px-4 py-4 transition-colors hover:bg-gray-100">
              <p className="text-sm font-semibold text-gray-900">KPI 현황</p>
              <p className="mt-1 text-sm text-gray-500">프로젝트 수, 공개율, 응답량 등 핵심 지표를 확인합니다.</p>
            </Link>
            <Link href="/dashboard/category" className="block rounded-2xl bg-gray-50 px-4 py-4 transition-colors hover:bg-gray-100">
              <p className="text-sm font-semibold text-gray-900">카테고리 분석</p>
              <p className="mt-1 text-sm text-gray-500">현재 운영 상태 기준으로 프로젝트 분포를 빠르게 점검합니다.</p>
            </Link>
            <Link href="/dashboard/realtime" className="block rounded-2xl bg-gray-50 px-4 py-4 transition-colors hover:bg-gray-100">
              <p className="text-sm font-semibold text-gray-900">실시간 보드</p>
              <p className="mt-1 text-sm text-gray-500">가장 최근에 들어온 응답 흐름을 프로젝트 단위로 확인합니다.</p>
            </Link>
          </div>
        </section>
      </div>
    </WorkspacePage>
  )
}
