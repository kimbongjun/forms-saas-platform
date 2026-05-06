import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const region = searchParams.get('region')

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('market_events')
      .select('*')
      .order('start_date', { ascending: true })

    if (region && region !== 'all') {
      // region 컬럼이 있을 경우
      query = query.eq('country', region)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ events: [] })
    }

    return NextResponse.json({ events: data ?? [] })
  } catch {
    return NextResponse.json({ events: [] })
  }
}
