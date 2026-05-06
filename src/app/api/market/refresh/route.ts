import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

/**
 * POST /api/market/refresh
 * 수동 새로고침 트리거. 실제 운영에서는 여기서 외부 API(Google News, PubMed 등) 수집 후
 * market_articles / market_influencers / market_events 테이블에 upsert한다.
 * 현재는 타임스탬프만 반환.
 */
export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const refreshedAt = new Date().toISOString()

  return NextResponse.json({
    success: true,
    refreshedAt,
    message: '데이터 갱신 완료',
  })
}
