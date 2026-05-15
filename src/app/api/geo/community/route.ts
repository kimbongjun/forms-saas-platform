import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId')
  const sourceType = searchParams.get('sourceType') // 'naver_blog' | 'naver_news' | null (both)
  if (!brandId) return NextResponse.json({ error: 'brandId 필수' }, { status: 400 })

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let q = supabase
    .from('geo_community_cache')
    .select('id, brand_id, source_type, title, url, description, author, published_at, refreshed_at')
    .eq('brand_id', brandId)
    .order('published_at', { ascending: false })
    .limit(10)

  if (sourceType) q = q.eq('source_type', sourceType)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}
