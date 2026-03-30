import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">MKT Form Builder</h1>
          <p className="text-gray-500 text-sm">
            폼과 배너를 직접 구성해 고유 링크를 생성하고 공유하세요.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/new"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            새 프로젝트 만들기
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            프로젝트 목록 보기
          </Link>
        </div>
        <p className="text-sm">문의 : 김봉준 책임</p>
      </div>
    </div>
  )
}
