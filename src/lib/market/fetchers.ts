// src/lib/market/fetchers.ts
import Parser from 'rss-parser'
import type { RawArticle } from '@/lib/prompts/market'

const parser = new Parser({ timeout: 10000 })

// ── RSS 소스 목록 ─────────────────────────────────────────────────
const RSS_SOURCES = [
  { url: 'https://www.etnews.com/rss/allArticle.xml',    name: '전자신문',    category: 'tech_ai' },
  { url: 'https://zdnet.co.kr/Include/rss.xml',          name: 'ZDNet Korea', category: 'tech_ai' },
  { url: 'https://it.chosun.com/rss/rss.htm',            name: 'IT조선',      category: 'tech_ai' },
  { url: 'https://www.mediaus.co.kr/rss/allArticle.xml', name: '미디어스',    category: 'marketing_kol' },
  { url: 'https://beautyhankook.com/feed',               name: '뷰티한국',    category: 'marketing_kol' },
] as const

export async function fetchRssArticles(): Promise<RawArticle[]> {
  const results: RawArticle[] = []
  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      for (const item of (feed.items ?? []).slice(0, 8)) {
        if (!item.title || !item.link) continue
        results.push({
          title: item.title.trim(),
          description: item.contentSnippet ?? item.summary ?? '',
          url: item.link,
          source_name: source.name,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source_type: 'rss',
          thumbnail_url: item.enclosure?.url,
        })
      }
    } catch {
      // 개별 피드 실패 무시 — 다음 피드 계속
    }
  }
  return results
}

// ── Naver 뉴스 검색 API ───────────────────────────────────────────
const NAVER_KEYWORDS = [
  '뷰티 AI 기술',
  '의료기기 마케팅',
  '인플루언서 마케팅 트렌드',
  '메디컬 에스테틱',
  '뷰티 박람회',
]

export async function fetchNaverNewsArticles(): Promise<RawArticle[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) return []

  const results: RawArticle[] = []
  for (const keyword of NAVER_KEYWORDS) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=10&sort=date`,
        {
          headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
          signal: AbortSignal.timeout(8000),
        },
      )
      if (!res.ok) continue
      const data = (await res.json()) as { items?: { title: string; description: string; originallink: string; link: string; pubDate: string }[] }
      for (const item of data.items ?? []) {
        results.push({
          title: item.title.replace(/<[^>]+>/g, '').trim(),
          description: item.description.replace(/<[^>]+>/g, '').trim(),
          url: item.originallink || item.link,
          source_name: 'Naver 뉴스',
          published_at: new Date(item.pubDate).toISOString(),
          source_type: 'naver',
        })
      }
    } catch {
      // 키워드별 실패 무시
    }
  }
  return results
}

// ── Google News RSS ───────────────────────────────────────────────
const GOOGLE_NEWS_QUERIES = [
  '뷰티 의료기기 기술 AI',
  'K-beauty 인플루언서 마케팅',
  '뷰티 박람회 행사 2026',
]

export async function fetchGoogleNewsArticles(): Promise<RawArticle[]> {
  const results: RawArticle[] = []
  for (const q of GOOGLE_NEWS_QUERIES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue
      const text = await res.text()
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) ?? []
      for (const item of items.slice(0, 8)) {
        const title = item.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>/)?.[1]
          ?? item.match(/<title>(.+?)<\/title>/)?.[1]
          ?? ''
        const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? ''
        const pubDate = item.match(/<pubDate>(.+?)<\/pubDate>/)?.[1] ?? ''
        const source = item.match(/<source[^>]*><!\[CDATA\[(.+?)\]\]><\/source>/)?.[1]
          ?? item.match(/<source[^>]*>(.+?)<\/source>/)?.[1]
          ?? 'Google News'
        if (!title || !link) continue
        results.push({
          title: title.trim(),
          description: '',
          url: link.trim(),
          source_name: source.trim(),
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source_type: 'google_news',
        })
      }
    } catch {
      // 쿼리별 실패 무시
    }
  }
  return results
}

// ── YouTube Data API ──────────────────────────────────────────────
export async function fetchYoutubeContent(): Promise<RawArticle[]> {
  const ytKey = process.env.YOUTUBE_API_KEY
  if (!ytKey) return []
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('뷰티 마케팅 트렌드 2026')}&type=video&order=date&maxResults=10&relevanceLanguage=ko&key=${ytKey}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    const data = (await res.json()) as {
      items?: { id: { videoId: string }; snippet: { title: string; description: string; channelTitle: string; publishedAt: string; thumbnails?: { medium?: { url: string } } } }[]
    }
    return (data.items ?? []).map(item => ({
      title: item.snippet.title,
      description: item.snippet.description.slice(0, 200),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source_name: item.snippet.channelTitle,
      published_at: item.snippet.publishedAt,
      source_type: 'youtube' as const,
      thumbnail_url: item.snippet.thumbnails?.medium?.url,
    }))
  } catch {
    return []
  }
}
