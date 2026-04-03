import Link from 'next/link'

export default function NewProjectWizardPage() {
  const steps = [
    {
      step: 'Step 1',
      title: 'Category Selection',
      description: 'PR, 프로모션, 바이럴, HCP, B2B 중 프로젝트 유형을 먼저 선택합니다.',
    },
    {
      step: 'Step 2',
      title: 'Basic Setup',
      description: '프로젝트명, 기간, 기본 정보와 초기 예산 규모를 설정합니다.',
    },
    {
      step: 'Step 3',
      title: 'Team Assign',
      description: '프로젝트 멤버와 관련 부서를 배정하고 알림 범위를 정합니다.',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Projects / Project Wizard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">신규 프로젝트 생성 가이드</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
          수정된 IA 기준으로 프로젝트 생성은 3단계 Wizard 흐름으로 정리했습니다. 현재 구현에서는 아래 순서를 확인한 뒤 실제 생성 화면으로 진입할 수 있습니다.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{item.step}</p>
              <h2 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/projects/new/build"
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            생성 화면으로 이동
          </Link>
          <Link
            href="/projects"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            프로젝트 목록
          </Link>
        </div>
      </section>
    </div>
  )
}
