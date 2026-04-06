import { Target } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'
import GoalPlanner from '@/components/workspace/GoalPlanner'
import type { ProjectGoalItem } from '@/types/database'

interface ProjectGoalsPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectGoalsPage({ params }: ProjectGoalsPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title')
    .eq('id', id)
    .single()

  if (projectError || !project) notFound()

  const { data: plan, error: planError } = await supabase
    .from('project_goal_plans')
    .select('items')
    .eq('project_id', id)
    .single()

  const tableMissing = planError?.code === '42P01'
  const notFoundPlan = planError?.code === 'PGRST116'
  const warning =
    tableMissing
      ? '목표 KPI 테이블이 아직 생성되지 않았습니다. 마이그레이션 적용 후 저장이 가능합니다.'
      : null

  const initialItems: ProjectGoalItem[] =
    !planError || notFoundPlan
      ? ((Array.isArray(plan?.items) ? plan.items : []) as ProjectGoalItem[])
      : []

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-900 p-2 text-white">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Goals</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">목표 KPI 관리</h2>
            <p className="mt-1 text-sm text-gray-500">
              프로젝트별 목표, 실적, 가중치를 한 표에서 관리하고 달성률을 추적하세요.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              시트 형태로 입력된 KPI는 저장 후 프로젝트 운영 기준표로 활용할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <GoalPlanner projectId={id} initialItems={initialItems} warning={warning} />
    </div>
  )
}
