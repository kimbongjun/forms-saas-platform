import { NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { fetchYouTubeCount } from '@/lib/some-content/crawlers'

// 서버사이드 1시간 캐시
const SYNC_CACHE = new Map<string, number>()
const CACHE_TTL = 60 * 60 * 1000

async function fetchNaverTotal(
  keyword: string,
  type: 'blog' | 'cafearticle' | 'news',
  clientId: string,
  clientSecret: string,
): Promise<number> {
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(keyword)}&display=1`,
      {
        headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return 0
    const json = await res.json() as { total?: number }
    return json.total ?? 0
  } catch { return 0 }
}

async function fetchNaverBlogItems(
  keyword: string,
  clientId: string,
  clientSecret: string,
): Promise<{ title: string; description: string; link: string; bloggername: string; postdate: string }[]> {
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(keyword)}&display=5&sort=date`,
      {
        headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return []
    const json = await res.json() as { items?: { title: string; description: string; link: string; bloggername: string; postdate: string }[] }
    return json.items ?? []
  } catch { return [] }
}

async function fetchNaverNewsItems(
  keyword: string,
  clientId: string,
  clientSecret: string,
): Promise<{ title: string; description: string; link: string; pubDate: string; originallink: string }[]> {
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=5&sort=date`,
      {
        headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return []
    const json = await res.json() as { items?: { title: string; description: string; link: string; pubDate: string; originallink: string }[] }
    return json.items ?? []
  } catch { return [] }
}

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  const ytKey = process.env.YOUTUBE_API_KEY
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 설정되지 않았습니다.' },
      { status: 503 },
    )
  }

  const { data: keywords } = await supabase
    .from('sc_keywords')
    .select('id, keyword')
    .eq('is_active', true)

  if (!keywords?.length) return NextResponse.json({ synced: 0, message: '활성 키워드 없음' })

  const today = new Date().toISOString().split('T')[0]
  let synced = 0

  for (const kw of keywords) {
    const cacheKey = `${kw.id}:${today}`
    const lastTs = SYNC_CACHE.get(cacheKey)
    if (lastTs && Date.now() - lastTs < CACHE_TTL) continue

    // ── 병렬 API 호출 ────────────────────────────────────────────
    const [blog, cafe, news, ytCount] = await Promise.all([
      fetchNaverTotal(kw.keyword, 'blog', clientId, clientSecret),
      fetchNaverTotal(kw.keyword, 'cafearticle', clientId, clientSecret),
      fetchNaverTotal(kw.keyword, 'news', clientId, clientSecret),
      ytKey ? fetchYouTubeCount(kw.keyword, ytKey) : Promise.resolve(0),
    ])

    const naverTotal = blog + cafe + news

    const channelCounts: Record<string, number> = {
      naver_blog: blog,
      naver_cafe: cafe,
      naver_news: news,
      // YouTube: 실측 (API 키 있으면) or 추정
      youtube: ytCount > 0 ? ytCount : Math.round(naverTotal * 0.05),
      // 나머지: 비례 추정 (추후 크롤링/API 연동 시 교체)
      instagram:     Math.round(naverTotal * 0.15),
      twitter:       Math.round(naverTotal * 0.08),
      facebook:      Math.round(naverTotal * 0.03),
      dcinside:      Math.round(naverTotal * 0.04),
      ppomppu:       Math.round(naverTotal * 0.02),
      gangnam_unnie: Math.round(naverTotal * 0.06),
      babitalk:      Math.round(naverTotal * 0.04),
      fmkorea:       Math.round(naverTotal * 0.03),
      theqoo:        Math.round(naverTotal * 0.05),
      sungyesa:      Math.round(naverTotal * 0.06),
    }

    await supabase.from('sc_mentions').upsert(
      Object.entries(channelCounts).map(([channel, count]) => ({
        keyword_id: kw.id,
        channel,
        mention_date: today,
        count,
        synced_at: new Date().toISOString(),
      })),
      { onConflict: 'keyword_id,channel,mention_date' },
    )

    // ── 원문 수집: 네이버 블로그 + 뉴스 ─────────────────────────
    const [blogItems, newsItems] = await Promise.all([
      fetchNaverBlogItems(kw.keyword, clientId, clientSecret),
      fetchNaverNewsItems(kw.keyword, clientId, clientSecret),
    ])

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    for (const ch of ['naver_blog', 'naver_news'] as const) {
      await supabase.from('sc_posts').delete()
        .eq('keyword_id', kw.id)
        .eq('channel', ch)
        .gte('fetched_at', oneDayAgo)
    }

    const postRows = [
      ...blogItems.map(item => ({
        keyword_id: kw.id,
        channel: 'naver_blog',
        title: item.title.replace(/<[^>]+>/g, ''),
        content: item.description.replace(/<[^>]+>/g, ''),
        url: item.link,
        author: item.bloggername,
        sentiment: null,
        published_at: item.postdate?.length === 8
          ? `${item.postdate.slice(0, 4)}-${item.postdate.slice(4, 6)}-${item.postdate.slice(6, 8)}`
          : null,
        fetched_at: new Date().toISOString(),
      })),
      ...newsItems.map(item => ({
        keyword_id: kw.id,
        channel: 'naver_news',
        title: item.title.replace(/<[^>]+>/g, ''),
        content: item.description.replace(/<[^>]+>/g, ''),
        url: item.originallink || item.link,
        author: null,
        sentiment: null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        fetched_at: new Date().toISOString(),
      })),
    ]

    if (postRows.length > 0) await supabase.from('sc_posts').insert(postRows)

    SYNC_CACHE.set(cacheKey, Date.now())
    synced++
  }

  // ── sync 완료 후 Claude 분석 자동 트리거 ─────────────────────
  // 백그라운드 실행 (await 없음 — sync 응답 지연 방지)
  void triggerClaudeAnalysis(keywords ?? [], supabase)

  return NextResponse.json({
    synced,
    total: keywords.length,
    youtube_real: !!ytKey,
    synced_at: new Date().toISOString(),
  })
}

// ── 헬퍼: 키워드별 Claude 분석 트리거 ────────────────────────────
async function triggerClaudeAnalysis(
  keywords: { id: string; keyword: string }[],
  supabase: Awaited<ReturnType<typeof import('@/utils/supabase/server').createServerClient>>,
) {
  for (const kw of keywords) {
    try {
      // 채널별 언급량 집계
      const today = new Date().toISOString().split('T')[0]
      const { data: mentions } = await supabase
        .from('sc_mentions')
        .select('channel, count')
        .eq('keyword_id', kw.id)
        .eq('mention_date', today)

      const mentionsByChannel = Object.fromEntries(
        (mentions ?? []).map(m => [m.channel as string, m.count as number]),
      )

      // 최신 포스트 10개
      const { data: posts } = await supabase
        .from('sc_posts')
        .select('channel, content, sentiment')
        .eq('keyword_id', kw.id)
        .order('fetched_at', { ascending: false })
        .limit(10)

      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/some-content/claude-analysis`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword_id: kw.id,
            keyword: kw.keyword,
            mentionsByChannel,
            sentimentDistribution: { positive: 33, negative: 17, neutral: 50 },
            topKeywords: [],
            trendData: null,
            mentionSummary: mentionsByChannel,
            topPosts: (posts ?? []).map(p => ({
              channel: p.channel as string,
              content: (p.content as string | null) ?? '',
              sentiment: p.sentiment as string | null,
            })),
          }),
        },
      )
    } catch {
      // 키워드별 Claude 실패 무시 — sync 결과에 영향 없음
    }
  }
}
