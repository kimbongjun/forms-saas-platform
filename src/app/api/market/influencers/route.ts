import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platform = searchParams.get('platform')

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('market_influencers')
      .select('*')
      .order('follower_count', { ascending: false })
      .limit(30)

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ influencers: [] })
    }

    return NextResponse.json({ influencers: data ?? [] })
  } catch {
    return NextResponse.json({ influencers: [] })
  }
}
