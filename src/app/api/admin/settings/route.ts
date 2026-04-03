import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getUserRole } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.from('site_settings').select('settings').eq('id', 1).single()
    return NextResponse.json(data?.settings ?? {})
  } catch {
    return NextResponse.json({})
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    const role = await getUserRole(user.id)
    if (role !== 'administrator') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

    const body = await req.json()
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, settings: body })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : '서버 오류' }, { status: 500 })
  }
}
