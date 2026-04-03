import WorkspacePage from '@/components/workspace/WorkspacePage'

export default function SharedFeedbackPage() {
  return (
    <WorkspacePage
      eyebrow="Shared Center / Feedback"
      title="피드백 관리"
      description="리포트 공유 이후 들어오는 코멘트, 후속 요청, 협업 피드백을 한곳에서 수집하는 허브입니다."
      actions={[
        { href: '/shared/reports', label: '리포트 공유' },
        { href: '/projects', label: '프로젝트 목록', variant: 'secondary' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">공유 이후 액션</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">리포트 단위로 받은 의견을 다음 프로젝트의 Next Action과 연결하기 좋은 위치입니다.</p>
        </div>
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <p className="text-sm font-semibold text-gray-900">향후 확장</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">댓글 스레드, 상태 관리, 리뷰 승인 프로세스 같은 후속 기능을 붙일 수 있도록 구조만 먼저 열어 두었습니다.</p>
        </div>
      </div>
    </WorkspacePage>
  )
}
