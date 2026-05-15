import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

// GET /api/geo/tech-snapshot?brandId=volnewmer
// 해당 브랜드의 최신 tech 스냅샷 반환. 없으면 geo-data.ts 정적 데이터 폴백.
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const brandId = new URL(req.url).searchParams.get('brandId')
  if (!brandId) return NextResponse.json({ error: 'brandId 필수' }, { status: 400 })

  const { data, error } = await supabase
    .from('geo_tech_snapshots')
    .select('*')
    .eq('brand_id', brandId)
    .order('collected_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[geo/tech-snapshot] DB error:', error.message)
  }

  if (!data) {
    const brand = GEO_DATA.find(b => b.id === brandId)
    if (!brand) return NextResponse.json({ error: '브랜드 없음' }, { status: 404 })
    return NextResponse.json({ snapshot: brand.tech, source: 'static' })
  }

  return NextResponse.json({ snapshot: data, source: 'live' })
}
