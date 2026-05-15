import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// Vercel Cron: GET /api/cron/geo-scores — 매일 02:00 KST (17:00 UTC)
// 현재 GEO_DATA의 점수를 Supabase에 일별 스냅샷으로 저장 (시계열 트렌드 차트용)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const today   = new Date().toISOString().split('T')[0]

  const rows = GEO_DATA.map(b => ({
    brand_id:        b.id,
    snapshot_date:   today,
    geo_score:       b.geo_score,
    tech_score:      b.tech.eeeat_score,
    authority_score: b.authority.authority_score,
    aeo_score:       b.aeo.visibility_score,
    community_score: b.community.community_score,
    media_score:     b.earned_media.media_score,
  }))

  const { error } = await supabase
    .from('geo_score_snapshots')
    .upsert(rows, { onConflict: 'brand_id,snapshot_date' })

  if (error) {
    console.error('[cron/geo-scores] DB error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: rows.length, snapshot_date: today })
}
