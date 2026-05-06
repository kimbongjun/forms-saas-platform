import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('market_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      // 테이블이 없는 경우 빈 배열 반환 (프론트에서 목 데이터 사용)
      return NextResponse.json({ articles: [] })
    }

    return NextResponse.json({ articles: data ?? [] })
  } catch {
    return NextResponse.json({ articles: [] })
  }
}
