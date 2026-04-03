import { createServerClient } from '@/utils/supabase/server'
import WorkspacePage from '@/components/workspace/WorkspacePage'

export default async function DashboardKpiPage() {
  const supabase = await createServerClient()

  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: totalFields },
    { count: totalSubmissions },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('form_fields').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
  ])

  const projectCount = totalProjects ?? 0
  const publishedCount = publishedProjects ?? 0
  const fieldCount = totalFields ?? 0
  const submissionCount = totalSubmissions ?? 0
  const publishRate = projectCount > 0 ? `${Math.round((publishedCount / projectCount) * 100)}%` : '0%'
  const avgFields = projectCount > 0 ? (fieldCount / projectCount).toFixed(1) : '0.0'
  const avgResponses = projectCount > 0 ? (submissionCount / projectCount).toFixed(1) : '0.0'

  return (
    <WorkspacePage
      eyebrow="Dashboard / KPI"
      title="KPI 현황"
      description="현재 스키마에서 바로 측정 가능한 운영 KPI를 기준으로 대시보드 허브를 구성했습니다. 프로젝트 수, 공개율, 필드 밀도, 응답량을 빠르게 읽을 수 있습니다."
      actions={[
        { href: '/projects', label: '프로젝트 열기' },
        { href: '/dashboard/realtime', label: '실시간 보드', variant: 'secondary' },
      ]}
      stats={[
        { label: 'Total Projects', value: String(projectCount), helper: '운영 중인 전체 프로젝트' },
        { label: 'Publish Rate', value: publishRate, helper: '공개 상태 비중' },
        { label: 'Avg. Fields', value: avgFields, helper: '프로젝트당 평균 필드 수' },
        { label: 'Avg. Responses', value: avgResponses, helper: '프로젝트당 평균 응답 수' },
      ]}
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">운영 관점</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            신규 프로젝트 생성은 `/projects/new`로 모으고, KPI 화면은 전체 운영량을 읽는 허브로 분리했습니다.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">폼 관점</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            누적 필드 수와 프로젝트당 평균 필드 수를 통해 폼 구조의 복잡도를 빠르게 파악할 수 있습니다.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">응답 관점</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            실시간 응답 흐름은 별도 보드로 분리하고, KPI 페이지는 전체 응답량을 요약해서 보여줍니다.
          </p>
        </div>
      </section>
    </WorkspacePage>
  )
}
