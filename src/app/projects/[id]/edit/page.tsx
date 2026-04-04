import { notFound, redirect } from 'next/navigation'
import ProjectWizard from '@/components/workspace/ProjectWizard'
import { createServerClient } from '@/utils/supabase/server'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, category, start_date, end_date, budget, country, venue_name, venue_map_url, workspace_project_id')
    .eq('id', id)
    .single()

  if (projectError || !project) notFound()
  if (project.workspace_project_id) redirect(`/projects/${id}`)

  const { data: members } = await supabase
    .from('project_members')
    .select('id, name, email, role, department, notify')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  return (
    <ProjectWizard
      mode="edit"
      projectId={id}
      initialData={{
        category: project.category,
        title: project.title,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        country: project.country,
        venueName: project.venue_name,
        venueMapUrl: project.venue_map_url,
        members: members ?? [],
      }}
    />
  )
}
