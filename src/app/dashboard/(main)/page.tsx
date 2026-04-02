import { createServerClient } from '@/utils/supabase/server'
import ProjectList from '@/components/dashboard/ProjectList'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`id, title, slug, banner_url, thumbnail_url, created_at, is_published, form_fields (count)`)
    .order('created_at', { ascending: false })

  const normalized = (projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    banner_url: p.banner_url ?? null,
    thumbnail_url: (p as unknown as { thumbnail_url?: string | null }).thumbnail_url ?? null,
    created_at: p.created_at,
    created_at_label: new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    }).format(new Date(p.created_at)),
    is_published: p.is_published ?? true,
    fieldCount:
      Array.isArray(p.form_fields) && p.form_fields.length > 0
        ? (p.form_fields[0] as { count: number }).count
        : 0,
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      )}
      <ProjectList projects={normalized} />
    </div>
  )
}
