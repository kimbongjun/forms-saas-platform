import WorkspacePage from '@/components/workspace/WorkspacePage'

export default function EngagementLeadsPage() {
  return (
    <WorkspacePage
      eyebrow="Engagement / Leads"
      title="통합 리드 DB"
      description="프로젝트 단위로 흩어져 있는 응답 데이터를 장기적으로 통합 관리하는 영역입니다. 현재 IA에서는 Live Responses 이후의 허브로 자리를 잡아 두었습니다."
      actions={[
        { href: '/dashboard/realtime', label: '실시간 보드' },
        { href: '/projects', label: '프로젝트 목록', variant: 'secondary' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">프로젝트 응답 집계</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">각 프로젝트의 Live Responses를 장기 관리 대상 리드로 승격하는 중간 허브로 설계했습니다.</p>
        </div>
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <p className="text-sm font-semibold text-gray-900">확장 포인트</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">태그, 상태, 담당자, 후속 액션 같은 CRM 성격의 스키마는 실제 운영 규칙이 정리되면 이 위치에 붙이면 됩니다.</p>
        </div>
      </div>
    </WorkspacePage>
  )
}
