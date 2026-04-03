import WorkspacePage from '@/components/workspace/WorkspacePage'

export default function EngagementTemplatesPage() {
  return (
    <WorkspacePage
      eyebrow="Engagement / Templates"
      title="템플릿 라이브러리"
      description="프로젝트 실행에서 검증된 폼 구조를 재사용 가능한 템플릿 자산으로 축적하는 영역입니다. 향후 카테고리별 생성 위자드와 연결되는 기준점으로 사용할 수 있습니다."
      actions={[
        { href: '/projects', label: '프로젝트 탐색' },
        { href: '/projects/new', label: '새 프로젝트', variant: 'secondary' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">카테고리별 시작점</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">반복되는 프로젝트 유형을 템플릿으로 묶어 새 프로젝트 생성 위자드와 연결하기 좋은 위치입니다.</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">폼 구조 재사용</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">현재 운영 중인 Form Builder 결과물을 추후 이 허브에서 복제 가능한 자산으로 승격할 수 있습니다.</p>
        </div>
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <p className="text-sm font-semibold text-gray-900">다음 단계</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">현재는 IA 경로와 화면 구조를 먼저 고정했습니다. 템플릿 메타데이터와 승인 규칙이 정해지면 기능을 확장하면 됩니다.</p>
        </div>
      </div>
    </WorkspacePage>
  )
}
