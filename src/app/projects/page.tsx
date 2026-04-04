import { createServerClient } from '@/utils/supabase/server'
import ProjectList from '@/components/dashboard/ProjectList'
import WorkspacePage from '@/components/workspace/WorkspacePage'

export default async function ProjectsPage() {
  const supabase = await createServerClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, slug, created_at, is_published, category, start_date, end_date, budget, country')
    .is('workspace_project_id', null)   // 워크스페이스 루트 프로젝트만
    .order('created_at', { ascending: false })

  // 프로젝트별 멤버 수, 폼(child) 수 병렬 조회
  const projectIds = (projects ?? []).map((p) => p.id)
  const [{ data: memberRows }, { data: formRows }] = await Promise.all([
    projectIds.length > 0
      ? supabase.from('project_members').select('project_id, name, role').in('project_id', projectIds)
      : Promise.resolve({ data: [] }),
    projectIds.length > 0
      ? supabase.from('projects').select('workspace_project_id').in('workspace_project_id', projectIds)
      : Promise.resolve({ data: [] }),
  ])

  const memberCount: Record<string, number> = {}
  const ownerName: Record<string, string> = {}
  const memberNames: Record<string, string[]> = {}
  for (const r of memberRows ?? []) {
    memberCount[r.project_id] = (memberCount[r.project_id] ?? 0) + 1
    if (r.role === 'owner' && r.name) ownerName[r.project_id] = r.name
    if (r.name) {
      memberNames[r.project_id] = [...(memberNames[r.project_id] ?? []), r.name]
    }
  }
  const formCount: Record<string, number> = {}
  for (const r of formRows ?? []) {
    if (r.workspace_project_id) {
      formCount[r.workspace_project_id] = (formCount[r.workspace_project_id] ?? 0) + 1
    }
  }

  const normalized = (projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    created_at: p.created_at,
    is_published: p.is_published ?? true,
    category: (p as { category?: string | null }).category ?? null,
    start_date: (p as { start_date?: string | null }).start_date ?? null,
    end_date: (p as { end_date?: string | null }).end_date ?? null,
    budget: (p as { budget?: number | null }).budget ?? null,
    country: (p as { country?: string | null }).country ?? null,
    memberCount: memberCount[p.id] ?? 0,
    formCount: formCount[p.id] ?? 0,
    ownerName: ownerName[p.id] ?? null,
    memberNames: memberNames[p.id] ?? [],
  }))

  return (
    <WorkspacePage
      eyebrow="Projects"
      title="프로젝트 목록"
      actions={[
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
