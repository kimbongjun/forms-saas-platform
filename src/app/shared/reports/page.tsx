import WorkspacePage from '@/components/workspace/WorkspacePage'

export default function SharedReportsPage() {
  return (
    <WorkspacePage
      eyebrow="Shared Center / Reports"
      title="리포트 공유 관리"
      description="Data Stats와 Insight 단계에서 정리된 결과물을 대외 공유 가능한 패키지로 전환하는 허브입니다."
      actions={[
        { href: '/dashboard/kpi', label: 'KPI 현황' },
        { href: '/projects', label: '프로젝트 목록', variant: 'secondary' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">성과 전달</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">프로젝트별 정량 결과와 인사이트를 공유 가능한 리포트 단위로 묶기 좋은 위치입니다.</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">링크 기반 배포</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">추후 외부 공개 링크, 만료 정책, 공유 권한 같은 배포 규칙을 이 허브에서 관리할 수 있습니다.</p>
        </div>
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <p className="text-sm font-semibold text-gray-900">현재 상태</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">IA와 메뉴 구조를 먼저 정리했고, 실제 리포트 생성 기능은 추후 붙일 수 있도록 공간을 확보했습니다.</p>
        </div>
      </div>
    </WorkspacePage>
  )
}
