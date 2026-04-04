import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import GanttWBS from './_components/GanttWBS'

interface SchedulePageProps {
  params: Promise<{ id: string }>
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ error }, { data: tasks }] = await Promise.all([
    supabase.from('projects').select('id').eq('id', id).single(),
    supabase
      .from('project_tasks')
      .select('id, project_id, title, assignee, start_date, due_date, status, progress, order_index')
      .eq('project_id', id)
      .order('order_index', { ascending: true }),
  ])

  if (error) notFound()

  const normalizedTasks = (tasks ?? []).map((t) => ({
    ...t,
    progress: t.progress ?? 0,
    start_date: t.start_date ?? null,
  }))

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Schedule</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">일정 현황표</h2>
        <p className="mt-2 text-sm text-gray-500">
          태스크별 일정을 월/주차 단위 Gantt 차트로 확인합니다.
          행을 클릭해 수정하거나 <span className="font-medium text-gray-700">태스크 추가</span> 버튼으로 새 항목을 등록하세요.
        </p>
      </section>

      <GanttWBS projectId={id} initialTasks={normalizedTasks} />
    </div>
  )
}
