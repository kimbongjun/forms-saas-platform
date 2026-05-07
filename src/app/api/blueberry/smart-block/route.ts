import { NextRequest, NextResponse } from 'next/server'

// 2시간 캐시
const CACHE = new Map<string, { data: SmartBlockResult[]; ts: number }>()
const CACHE_TTL = 2 * 60 * 60 * 1000

export type SmartBlockPost = {
  title: string
  link: string
  description: string
  bloggername: string
  postdate: string // "YYYYMMDD"
}

export type SmartBlockResult = {
  topic: string
  total: number
  posts: SmartBlockPost[]
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

async function fetchNaverBlog(
  query: string,
  clientId: string,
  clientSecret: string,
  display = 5,
): Promise<{ total: number; posts: SmartBlockPost[] }> {
  try {
    const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=${display}&sort=sim`
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { total: 0, posts: [] }
    const json = await res.json() as {
      total?: number
      items?: {
        title: string
        link: string
        description: string
        bloggername: string
        postdate: string
      }[]
    }
    const posts: SmartBlockPost[] = (json.items ?? []).map(item => ({
      title: stripHtml(item.title ?? ''),
      link: item.link ?? '',
      description: stripHtml(item.description ?? ''),
      bloggername: item.bloggername ?? '',
      postdate: item.postdate ?? '',
    }))
    return { total: json.total ?? 0, posts }
  } catch {
    return { total: 0, posts: [] }
  }
}

export async function POST(req: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 미설정' }, { status: 503 })
  }

  const { keyword, subTopics } = await req.json() as {
    keyword?: string
    subTopics?: string[]
  }
  if (!keyword?.trim()) {
    return NextResponse.json({ error: 'keyword 필요' }, { status: 400 })
  }

  const topics: string[] = [
    keyword.trim(),
    ...(Array.isArray(subTopics) ? subTopics.slice(0, 6) : []),
  ]

  const cacheKey = topics.join('|')
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  const results = await Promise.all(
    topics.map(async (topic): Promise<SmartBlockResult> => {
      const { total, posts } = await fetchNaverBlog(topic, clientId, clientSecret, 5)
      return { topic, total, posts }
    })
  )

  // 포스트가 있는 토픽만 반환
  const filtered = results.filter(r => r.posts.length > 0)
  CACHE.set(cacheKey, { data: filtered, ts: Date.now() })
  return NextResponse.json(filtered)
}
