import Link from 'next/link'
import { Tag } from 'lucide-react'
import { getReleaseNotes } from '@/utils/public-content'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
}

export default async function ReleaseNotesPage() {
  const notes = await getReleaseNotes()

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">릴리즈노트</h1>
        </div>
        <p className="mt-1 text-sm text-gray-400">업데이트 이력과 변경 사항을 확인할 수 있습니다.</p>
      </div>
      {notes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-400">등록된 릴리즈노트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/release-notes/${note.id}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-mono font-semibold text-white">{note.version}</span>
                <span className="text-sm font-medium text-gray-900">{note.title}</span>
              </div>
              <span className="ml-4 shrink-0 text-xs text-gray-400">{formatDate(note.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
