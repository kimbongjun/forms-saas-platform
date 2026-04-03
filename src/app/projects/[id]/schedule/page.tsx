import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import GanttChart from './_components/GanttChart'

interface SchedulePageProps {
  params: Promise<{ id: string }>
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: project, error }, { data: milestones }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, start_date, end_date')
      .eq('id', id)
      .single(),
    supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', id)
      .order('start_date', { ascending: true }),
  ])

  if (error || !project) notFound()

  return (
    <GanttChart
      projectId={id}
      projectStartDate={project.start_date ?? null}
      projectEndDate={project.end_date ?? null}
      initialMilestones={milestones ?? []}
    />
  )
}
