import Link from 'next/link'
import { createServerClient } from '@/utils/supabase/server'
import WorkspacePage from '@/components/workspace/WorkspacePage'

export default async function DashboardRealtimePage() {
  const supabase = await createServerClient()
  const [{ count: totalSubmissions }, { data: recentSubmissions }] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase
      .from('submissions')
      .select('id, project_id, created_at')
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const projectIds = Array.from(new Set((recentSubmissions ?? []).map((submission) => submission.project_id)))
  const projectMap: Record<string, { title: string }> = {}

  if (projectIds.length > 0) {
    const { data: projects } = await supabase.from('projects').select('id, title').in('id', projectIds)
    for (const project of projects ?? []) {
      projectMap[project.id] = { title: project.title }
    }
  }

  return (
    <WorkspacePage
      eyebrow="Dashboard / Realtime"
      title="실시간 보드"
      description="가장 최근 수집된 응답 흐름을 프로젝트 단위로 확인할 수 있는 보드입니다. 응답 운영 화면으로 바로 들어갈 수 있도록 새 IA 경로에 연결했습니다."
      actions={[
        { href: '/projects', label: '프로젝트 목록' },
        { href: '/dashboard/kpi', label: 'KPI 현황', variant: 'secondary' },
      ]}
      stats={[
        { label: 'Recent Feed', value: String((recentSubmissions ?? []).length), helper: '현재 표시 중인 최근 응답' },
        { label: 'Total Responses', value: String(totalSubmissions ?? 0), helper: '누적 응답 수' },
      ]}
    >
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">최근 응답 피드</h2>
            <p className="mt-1 text-sm text-gray-500">프로젝트별 응답 상세 화면으로 바로 이동할 수 있습니다.</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3">프로젝트</th>
                <th className="px-4 py-3">수집 시각</th>
                <th className="px-4 py-3">이동</th>
              </tr>
            </thead>
            <tbody>
              {(recentSubmissions ?? []).map((submission) => (
                <tr key={submission.id} className="border-t border-gray-100">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {projectMap[submission.project_id]?.title ?? '알 수 없는 프로젝트'}
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZone: 'Asia/Seoul',
                    }).format(new Date(submission.created_at))}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/projects/${submission.project_id}/execution/live-responses`}
                      className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                      Live Responses 열기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspacePage>
  )
}
