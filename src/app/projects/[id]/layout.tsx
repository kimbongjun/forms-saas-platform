import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import ProjectSectionNav from '@/components/workspace/ProjectSectionNav'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [
    { data: project, error: projectError },
    { count: fieldCount },
    { count: submissionCount },
  ] = await Promise.all([
    supabase.from('projects').select('id, title, slug, category, created_at, is_published').eq('id', id).single(),
    supabase.from('form_fields').select('*', { count: 'exact', head: true }).eq('project_id', id),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('project_id', id),
  ])

  if (projectError || !project) notFound()

  return (
    <div className="mx-auto max-w-8xl px-6 py-8">
      <section className="rounded-[32px] border border-gray-200 bg-white py-5 px-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>            
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">{project.title}</h1>
            <p className="mt-3 text-sm text-gray-500">
              {project.slug} ·{' '}
              {new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Seoul',
              }).format(new Date(project.created_at))}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {(project as { category?: string }).category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {(project as { category?: string }).category}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              project.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {project.is_published ? '공개' : '비공개'}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <ProjectSectionNav
          projectId={project.id}
          projectSlug={project.slug}
          fieldCount={fieldCount ?? 0}
          submissionCount={submissionCount ?? 0}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
