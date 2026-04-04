import { notFound } from 'next/navigation'
import { PiggyBank } from 'lucide-react'
import { createServerClient } from '@/utils/supabase/server'
import BudgetPlanner from '@/components/workspace/BudgetPlanner'
import type { ProjectBudgetItem } from '@/types/database'

interface BudgetPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectBudgetPage({ params }: BudgetPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, budget')
    .eq('id', id)
    .single()

  if (projectError || !project) notFound()

  const { data: plan, error: planError } = await supabase
    .from('project_budget_plans')
    .select('total_budget, currency, items')
    .eq('project_id', id)
    .single()

  const tableMissing = planError?.code === '42P01'
  const notFoundPlan = planError?.code === 'PGRST116'
  const warning =
    tableMissing
      ? '예산 테이블이 아직 생성되지 않았습니다. 마이그레이션 적용 후 저장이 가능합니다.'
      : null

  const initialItems: ProjectBudgetItem[] =
    !planError || notFoundPlan
      ? ((Array.isArray(plan?.items) ? plan.items : []) as ProjectBudgetItem[])
      : []

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-900 p-2 text-white">
            <PiggyBank className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Budget</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">예산 관리</h2>
            <p className="mt-1 text-sm text-gray-500">
              예산 범위, 종류, 비중을 설정하고 시각적으로 확인하세요.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              팁: 통화를 선택하면 입력칸에 해당 화폐 기호가 함께 표시됩니다.
            </p>
          </div>
        </div>
      </section>

      <BudgetPlanner
        projectId={id}
        initialTotalBudget={Number(plan?.total_budget ?? project.budget ?? 0)}
        initialCurrency={plan?.currency ?? 'KRW'}
        initialItems={initialItems}
        warning={warning}
      />
    </div>
  )
}
