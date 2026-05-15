import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { collectTechForBrand, type TechSnapshot } from '@/lib/geo/tech-collector'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// Vercel Cron: GET /api/cron/geo-tech — 매일 02:30 KST (17:30 UTC)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const targets = GEO_DATA.filter(b => b.website_url)
  const admin   = createAdminClient()
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
      console.error(`[cron/geo-tech] ${brand.name} 실패:`, msg)
      results.push({ brand: brand.name, ok: false, error: msg })
    }
  }

  return NextResponse.json({
    ok:           true,
    success:      results.filter(r => r.ok).length,
    total:        targets.length,
    results,
    collected_at: new Date().toISOString(),
  })
}
