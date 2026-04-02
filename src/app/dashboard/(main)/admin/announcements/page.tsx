import { createServerClient, getUserRole } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import DeleteAnnouncementButton from './DeleteAnnouncementButton'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
}

export default async function AdminAnnouncementsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const role = await getUserRole(user.id)
  if (role !== 'administrator') redirect('/dashboard')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, is_published, is_pinned, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">공지사항 관리</h1>
          <p className="text-xs text-gray-400">총 {announcements?.length ?? 0}건</p>
        </div>
        <Link
          href="/dashboard/admin/announcements/new"
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          새 공지
        </Link>
      </div>

      {(!announcements || announcements.length === 0) ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-400">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {announcements.map((a, i) => (
            <div
              key={a.id}
              className={['flex items-center gap-4 px-5 py-4', i > 0 ? 'border-t border-gray-100' : ''].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {a.is_pinned && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">공지</span>}
                  <span className={`truncate text-sm font-medium ${a.is_published ? 'text-gray-900' : 'text-gray-400'}`}>{a.title}</span>
                  {!a.is_published && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">비공개</span>}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(a.created_at)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/dashboard/admin/announcements/${a.id}/edit`}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  편집
                </Link>
                <DeleteAnnouncementButton id={a.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
