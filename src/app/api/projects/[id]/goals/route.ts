import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import type { ProjectGoalItem } from '@/types/database'

interface GoalPayload {
  items: ProjectGoalItem[]
}

function normalizeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function normalizeItem(item: ProjectGoalItem): ProjectGoalItem {
  return {
    id: normalizeText(item.id) || crypto.randomUUID(),
    item: normalizeText(item.item, '항목'),
    metric: normalizeText(item.metric),
    evaluation_method: item.evaluation_method === '정성' ? '정성' : '정량',
    unit: normalizeText(item.unit),
    target: normalizeText(item.target),
    actual: normalizeText(item.actual),
    gap: normalizeText(item.gap),
    final_evaluation: normalizeText(item.final_evaluation),
    weight_percent: Math.min(100, Math.max(0, Number(item.weight_percent) || 0)),
  }
}

async function verifyProjectAccess(projectId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }),
      supabase: null,
    }
  }

  const { data: ownedProject } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!ownedProject) {
    return {
      error: NextResponse.json({ error: '프로젝트 수정 권한이 없습니다.' }, { status: 403 }),
      supabase: null,
    }
  }

  return { error: null, supabase }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error, supabase } = await verifyProjectAccess(id)
    if (error || !supabase) return error

    const { data, error: fetchError } = await supabase
      .from('project_goal_plans')
      .select('items')
      .eq('project_id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return NextResponse.json({ plan: null })
      if (fetchError.code === '42P01') {
        return NextResponse.json({
          plan: null,
          warning: 'project_goal_plans 테이블이 아직 생성되지 않았습니다. 마이그레이션 적용 후 저장이 가능합니다.',
        })
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({
      plan: {
        items: Array.isArray(data.items) ? data.items : [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await req.json()) as GoalPayload
    const { error, supabase } = await verifyProjectAccess(id)
    if (error || !supabase) return error

    const items = Array.isArray(body.items) ? body.items.map(normalizeItem) : []

    const { error: saveError } = await supabase.from('project_goal_plans').upsert(
      {
        project_id: id,
        items,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    )

    if (saveError) {
      if (saveError.code === '42P01') {
        return NextResponse.json(
          { error: 'project_goal_plans 테이블이 없습니다. 마이그레이션을 먼저 적용해 주세요.' },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
