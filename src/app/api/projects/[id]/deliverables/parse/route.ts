import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { parseDeliverableUrl } from '@/features/deliverables/parser'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteContext) {
  void (await params) // id 미사용 (인증 확인에만 활용)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json() as { url?: string }
  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 })
  }

  return NextResponse.json(await parseDeliverableUrl(url))
}
