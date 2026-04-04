export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import EditFormBuilder from '@/components/builder/EditFormBuilder'

interface FormEditorPageProps {
  params: Promise<{ id: string; formId: string }>
  searchParams?: Promise<{ tab?: string }>
}

export default async function FormEditorPage({ params, searchParams }: FormEditorPageProps) {
  const { id: workspaceId, formId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createServerClient()

  const [{ data: project, error: projectError }, { data: fields }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('id', formId)
      .eq('workspace_project_id', workspaceId)
      .single(),
    supabase
      .from('form_fields')
      .select('*')
      .eq('project_id', formId)
      .order('order_index', { ascending: true }),
  ])

  if (projectError || !project) {
    // workspace_project_id가 없는 경우(기존 독립 프로젝트) 처리
    const { data: fallback, error: fallbackErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', formId)
      .single()

    if (fallbackErr || !fallback) notFound()

    // 이 폼이 이 워크스페이스에 연결되어 있지 않으면 리다이렉트
    if (fallback.workspace_project_id !== workspaceId) {
      redirect(`/projects/${workspaceId}/execution/forms`)
    }
  }

  const finalProject = project ?? (await supabase.from('projects').select('*').eq('id', formId).single()).data
  if (!finalProject) notFound()

  const initialDeadline = finalProject.deadline
    ? new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Seoul',
      }).format(new Date(finalProject.deadline)).replace(' ', 'T')
    : ''

  return (
    <EditFormBuilder
      workspaceId={workspaceId}
      project={finalProject}
      initialFields={fields ?? []}
      initialDeadline={initialDeadline}
      initialTab={resolvedSearchParams?.tab === 'responses' ? 'responses' : 'edit'}
      embedded
      backHref={`/projects/${workspaceId}/execution/forms`}
    />
  )
}
