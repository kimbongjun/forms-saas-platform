// src/app/api/market/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const tier = searchParams.get('tier')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 100)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 48시간 TTL: 이전 데이터는 폴백용으로 72시간까지 허용
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - 72)

  let query = supabase
    .from('market_articles')
    .select('*')
    .gte('fetched_at', cutoff.toISOString())
    .order('credibility_score', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') query = query.eq('category', category)
  if (tier) query = query.eq('priority_tier', tier)

  const { data, error } = await query
  if (error) return NextResponse.json({ articles: [], error: error.message })

  return NextResponse.json({ articles: data ?? [], count: data?.length ?? 0 })
}
