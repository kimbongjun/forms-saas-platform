import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import KanbanBoard from '@/components/workspace/KanbanBoard'

interface TasksPageProps {
  params: Promise<{ id: string }>
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const { error } = await supabase.from('projects').select('id').eq('id', id).single()
  if (error) notFound()

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Execution</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Task & WBS</h2>
        <p className="mt-2 text-sm text-gray-500">
          칸반 방식으로 업무를 관리합니다. 카드를 드래그해 상태를 변경하세요.
        </p>
      </section>

      <KanbanBoard projectId={id} />
    </div>
  )
}
