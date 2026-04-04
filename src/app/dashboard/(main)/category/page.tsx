import Link from 'next/link'
import { createServerClient } from '@/utils/supabase/server'
import WorkspacePage from '@/components/workspace/WorkspacePage'

export default async function DashboardCategoryPage() {
  const supabase = await createServerClient()
  const baseNow = new Date()
  const thirtyDaysAgo = new Date(baseNow)
  thirtyDaysAgo.setDate(baseNow.getDate() - 30)
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString()

  const [{ data: projects }, { count: recentCount }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, created_at, is_published')
      .is('workspace_project_id', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .is('workspace_project_id', null)
      .gte('created_at', thirtyDaysAgoIso),
  ])

  const projectList = projects ?? []
  const publishedCount = projectList.filter((project) => project.is_published).length
  const draftCount = projectList.length - publishedCount
  const recentProjectCount = recentCount ?? 0

  return (
    <WorkspacePage
      eyebrow="Dashboard / Category"
      title="카테고리 분석"
      description="현재 데이터 모델에는 별도 프로젝트 카테고리 컬럼이 없기 때문에, 이번 IA 개편에서는 운영 상태와 생성 시점 기준으로 프로젝트를 빠르게 분류할 수 있는 화면을 먼저 구성했습니다."
      actions={[
        { href: '/projects', label: '프로젝트 목록' },
        { href: '/projects/new', label: '새 프로젝트', variant: 'secondary' },
      ]}
      stats={[
        { label: 'Total', value: String(projectList.length), helper: '전체 프로젝트' },
        { label: 'Published', value: String(publishedCount), helper: '공개 상태' },
        { label: 'Draft', value: String(draftCount), helper: '비공개 상태' },
        { label: 'New 30D', value: String(recentProjectCount), helper: '최근 30일 생성' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">운영 상태 분포</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: '공개 프로젝트', count: publishedCount, color: 'bg-emerald-500' },
              { label: '비공개 프로젝트', count: draftCount, color: 'bg-gray-400' },
              { label: '최근 30일 신규 프로젝트', count: recentProjectCount, color: 'bg-blue-500' },
            ].map((item) => {
              const width = projectList.length > 0 ? `${Math.max(8, Math.round((item.count / projectList.length) * 100))}%` : '0%'

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>{item.label}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">최근 프로젝트</h2>
          <div className="mt-5 space-y-3">
            {projectList.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-2xl border border-gray-200 px-4 py-4 transition-colors hover:bg-gray-50"
              >
                <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {project.is_published ? '공개' : '비공개'} ·{' '}
                  {new Intl.DateTimeFormat('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Seoul',
                  }).format(new Date(project.created_at))}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WorkspacePage>
  )
}
