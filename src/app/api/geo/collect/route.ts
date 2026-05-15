import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { collectTechForBrand, type TechSnapshot } from '@/lib/geo/tech-collector'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

// POST /api/geo/collect
// Body: { brandId?: string }  — 생략 시 website_url 있는 전체 브랜드 수집
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { brandId?: string } = {}
  try { body = await req.json() } catch { /* empty body OK */ }

  const targets = body.brandId
    ? GEO_DATA.filter(b => b.id === body.brandId && b.website_url)
    : GEO_DATA.filter(b => b.website_url)

  if (targets.length === 0) {
    return NextResponse.json({ error: '수집 대상 브랜드 없음 (website_url 확인)' }, { status: 400 })
  }

  const admin = createAdminClient()
  const results: Array<{ brand: string; ok: boolean; error?: string }> = []

  for (const brand of targets) {
    try {
      const snapshot: TechSnapshot = await collectTechForBrand(brand.id, brand.website_url)
      const { error: dbError } = await admin
        .from('geo_tech_snapshots')
        .insert(snapshot)
      if (dbError) throw new Error(dbError.message)
      results.push({ brand: brand.name, ok: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[geo/collect] ${brand.name} 실패:`, msg)
      results.push({ brand: brand.name, ok: false, error: msg })
    }
  }

  return NextResponse.json({ ok: true, results, collected_at: new Date().toISOString() })
}
