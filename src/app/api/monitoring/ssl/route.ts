import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { checkSsl } from '@/lib/monitoring/check-ssl'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteId = req.nextUrl.searchParams.get('siteId')
  if (!siteId) return NextResponse.json({ error: 'siteId 필요' }, { status: 400 })

  const fresh = req.nextUrl.searchParams.get('fresh') === '1'

  const { data: site } = await supabase
    .from('monitor_sites')
    .select('url')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) return NextResponse.json({ error: '사이트를 찾을 수 없습니다.' }, { status: 404 })

  const result = await checkSsl(site.url, fresh)
  return NextResponse.json(result)
}
