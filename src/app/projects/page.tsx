import { createServerClient } from '@/utils/supabase/server'
import ProjectList from '@/components/dashboard/ProjectList'
import WorkspacePage from '@/components/workspace/WorkspacePage'

export default async function ProjectsPage() {
  const supabase = await createServerClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, slug, banner_url, thumbnail_url, created_at, is_published, form_fields (count)')
    .order('created_at', { ascending: false })

  const normalized = (projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    banner_url: project.banner_url ?? null,
    thumbnail_url: (project as { thumbnail_url?: string | null }).thumbnail_url ?? null,
    created_at: project.created_at,
    created_at_label: new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    }).format(new Date(project.created_at)),
    is_published: project.is_published ?? true,
    fieldCount:
      Array.isArray(project.form_fields) && project.form_fields.length > 0
        ? (project.form_fields[0] as { count: number }).count
        : 0,
  }))

  return (
    <WorkspacePage
      eyebrow="Projects"
      title="프로젝트 목록"      
      actions={[
        { href: '/projects/new', label: '새 프로젝트' },
        { href: '/dashboard', label: '대시보드', variant: 'secondary' },
      ]}
      stats={[
        { label: 'Projects', value: String(normalized.length), helper: '현재 관리 중인 프로젝트' },
      ]}
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      )}
      <ProjectList projects={normalized} />
    </WorkspacePage>
  )
}
