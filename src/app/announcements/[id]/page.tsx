import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SiteFooter from '@/components/common/SiteFooter'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!data) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link href="/announcements" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm text-gray-400">공지사항</span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <article className="rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mb-6 border-b border-gray-100 pb-6">
            {data.is_pinned && (
              <span className="mb-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">공지</span>
            )}
            <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
            <p className="mt-2 text-xs text-gray-400">{formatDate(data.created_at)}</p>
          </div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
