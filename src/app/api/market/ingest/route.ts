import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { fetchRssArticles, fetchNaverNewsArticles, fetchGoogleNewsArticles, fetchYoutubeContent } from '@/lib/market/fetchers'
import { deduplicateArticles, filterRecentArticles } from '@/lib/market/normalize'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [rss, naver, google, youtube] = await Promise.allSettled([
    fetchRssArticles(),
    fetchNaverNewsArticles(),
    fetchGoogleNewsArticles(),
    fetchYoutubeContent(),
  ])

  const all = [
    ...(rss.status === 'fulfilled' ? rss.value : []),
    ...(naver.status === 'fulfilled' ? naver.value : []),
    ...(google.status === 'fulfilled' ? google.value : []),
    ...(youtube.status === 'fulfilled' ? youtube.value : []),
  ]

  const articles = deduplicateArticles(filterRecentArticles(all, 7))
  return NextResponse.json({ articles, count: articles.length })
}
