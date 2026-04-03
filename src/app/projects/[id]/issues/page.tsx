import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import IssueTracker from './_components/IssueTracker'

interface IssuesPageProps {
  params: Promise<{ id: string }>
}

export default async function IssuesPage({ params }: IssuesPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ error: projectError }, { data: issues }] = await Promise.all([
    supabase.from('projects').select('id').eq('id', id).single(),
    supabase
      .from('project_issues')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (projectError) notFound()

  return (
    <IssueTracker projectId={id} initialIssues={issues ?? []} />
  )
}
