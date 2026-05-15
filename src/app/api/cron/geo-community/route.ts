import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { GEO_DATA } from '@/app/geo/_data/geo-data'

const NAVER_ID     = process.env.NAVER_CLIENT_ID ?? ''
const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET ?? ''

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
}

interface NaverBlogItem  { title: string; link: string; description: string; bloggername: string; postdate: string }
interface NaverNewsItem  { title: string; originallink: string; link: string; description: string; pubDate: string }

async function fetchNaver<T>(type: 'blog' | 'news', query: string): Promise<T[]> {
  const url = `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(query)}&display=5&sort=date`
  const res = await fetch(url, {
    headers: { 'X-Naver-Client-Id': NAVER_ID, 'X-Naver-Client-Secret': NAVER_SECRET },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Naver ${type} API ${res.status}: ${await res.text()}`)
  const data = await res.json() as { items: T[] }
  return data.items ?? []
}

// Vercel Cron: GET /api/cron/geo-community — 매일 03:00 KST (18:00 UTC)
// 네이버 블로그·뉴스 검색 결과를 Supabase geo_community_cache 에 저장
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase  = createAdminClient()
  const now       = new Date().toISOString()
  const results: Array<{ brand: string; blog: number; news: number; error?: string }> = []

  for (const brand of GEO_DATA) {
    try {
      const [blogSettled, newsSettled] = await Promise.allSettled([
        fetchNaver<NaverBlogItem>('blog',  `${brand.name} 시술 후기`),
        fetchNaver<NaverNewsItem>('news',  brand.name),
      ])

      type InsertRow = {
        brand_id: string; source_type: string; title: string; url: string
        description: string | null; author: string | null; published_at: string | null; refreshed_at: string
      }
      const rows: InsertRow[] = []

      if (blogSettled.status === 'fulfilled') {
        for (const it of blogSettled.value) {
          const d = it.postdate // "20260501"
          rows.push({
            brand_id:     brand.id,
            source_type:  'naver_blog',
            title:        stripHtml(it.title),
            url:          it.link,
            description:  stripHtml(it.description) || null,
            author:       it.bloggername || null,
            published_at: d.length === 8 ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : null,
            refreshed_at: now,
          })
        }
      }

      if (newsSettled.status === 'fulfilled') {
        for (const it of newsSettled.value) {
          rows.push({
            brand_id:     brand.id,
            source_type:  'naver_news',
            title:        stripHtml(it.title),
            url:          it.originallink || it.link,
            description:  stripHtml(it.description) || null,
            author:       null,
            published_at: it.pubDate ? new Date(it.pubDate).toISOString().split('T')[0] : null,
            refreshed_at: now,
          })
        }
      }

      // 기존 캐시 삭제 후 최신 결과 삽입
      await supabase.from('geo_community_cache').delete().eq('brand_id', brand.id)
      if (rows.length) await supabase.from('geo_community_cache').insert(rows)

      results.push({
        brand: brand.name,
        blog:  blogSettled.status === 'fulfilled' ? blogSettled.value.length : 0,
        news:  newsSettled.status === 'fulfilled' ? newsSettled.value.length : 0,
        ...(blogSettled.status  === 'rejected' || newsSettled.status === 'rejected'
          ? { error: [blogSettled, newsSettled].filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason as string).join('; ') }
          : {}),
      })
    } catch (err) {
      results.push({ brand: brand.name, blog: 0, news: 0, error: String(err) })
    }
  }

  return NextResponse.json({ ok: true, results, refreshed_at: now })
}
