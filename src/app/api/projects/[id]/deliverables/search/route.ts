import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { parseDeliverableUrl } from '@/features/deliverables/parser'
import type { ParsedDeliverable } from '@/features/deliverables/types'

type Platform = ParsedDeliverable['platform']

interface SearchCandidate extends ParsedDeliverable {
  key: string
  is_registered: boolean
  platform_priority: number
  recommended_score: number
}

interface SearchCacheEntry {
  expiresAt: number
  payload: {
    results: SearchCandidate[]
    notices: string[]
  }
}

const PLATFORM_QUERIES: Record<Exclude<Platform, 'other'>, string[]> = {
  youtube: ['site:youtube.com/watch', 'site:youtu.be'],
  instagram: ['site:instagram.com/p', 'site:instagram.com/reel'],
  tiktok: ['site:tiktok.com'],
  facebook: ['site:facebook.com', 'site:fb.watch'],
  twitter: ['site:x.com', 'site:twitter.com'],
}

const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000
const searchCache = new Map<string, SearchCacheEntry>()
const PLATFORM_PRIORITY: Record<Exclude<Platform, 'other'>, number> = {
  youtube: 100,
  instagram: 95,
  facebook: 80,
  twitter: 75,
  tiktok: 60,
}

function decodeDuckDuckGoUrl(rawUrl: string) {
  try {
    const absolute = rawUrl.startsWith('http') ? rawUrl : `https://duckduckgo.com${rawUrl}`
    const parsed = new URL(absolute)
    const uddg = parsed.searchParams.get('uddg')
    return uddg ? decodeURIComponent(uddg) : rawUrl
  } catch {
    return rawUrl
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
}

function getTimeoutSignal() {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(8000)
  }
  return undefined
}

function getCacheKey(keyword: string, platforms: Platform[]) {
  return `${keyword.toLowerCase()}::${[...platforms].sort().join(',')}`
}

function readCachedSearch(cacheKey: string) {
  const cached = searchCache.get(cacheKey)
  if (!cached) return null

  if (cached.expiresAt < Date.now()) {
    searchCache.delete(cacheKey)
    return null
  }

  return cached.payload
}

function writeCachedSearch(cacheKey: string, payload: SearchCacheEntry['payload']) {
  searchCache.set(cacheKey, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    payload,
  })
}

function getRecommendedScore(item: Pick<ParsedDeliverable, 'views' | 'likes' | 'comments' | 'shares' | 'published_at'>, platform: Exclude<Platform, 'other'>) {
  const engagementScore =
    item.views +
    item.likes * 4 +
    item.comments * 6 +
    item.shares * 8
  const recencyBoost = item.published_at ? 5000 : 0
  return PLATFORM_PRIORITY[platform] * 1000 + engagementScore + recencyBoost
}

async function searchDuckDuckGo(query: string, limit: number) {
  const endpoints = [
    'https://html.duckduckgo.com/html/',
    'https://duckduckgo.com/html/',
  ]

  for (const endpoint of endpoints) {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        kl: 'kr-ko',
        kp: '-2',
      })

      const res = await fetch(`${endpoint}?${searchParams.toString()}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
        next: { revalidate: 0 },
        signal: getTimeoutSignal(),
      })

      if (!res.ok) continue

      const html = await res.text()
      const matches = [
        ...html.matchAll(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi),
        ...html.matchAll(/<a[^>]+class="[^"]*result-link[^"]*"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi),
      ]

      if (matches.length === 0) continue

      return matches.slice(0, limit).map((match) => ({
        url: decodeDuckDuckGoUrl(match[1]),
        title: stripHtml(match[2]),
      }))
    } catch {
      continue
    }
  }

  return []
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { keyword?: string; platforms?: Platform[] }
  const keyword = body.keyword?.trim()
  const platforms = (body.platforms ?? []).filter((platform): platform is Exclude<Platform, 'other'> => platform in PLATFORM_QUERIES)

  if (!keyword) {
    return NextResponse.json({ error: '키워드를 입력해주세요.' }, { status: 400 })
  }

  if (platforms.length === 0) {
    return NextResponse.json({ error: '최소 1개 채널을 선택해주세요.' }, { status: 400 })
  }

  const cacheKey = getCacheKey(keyword, platforms)
  const cached = readCachedSearch(cacheKey)
  if (cached) {
    return NextResponse.json({
      ...cached,
      notices: [...cached.notices, '최근 조회 결과를 우선 표시했습니다.'],
    })
  }

  const notices: string[] = []

  const { data: existingRows, error: existingError } = await supabase
    .from('project_deliverables')
    .select('url')
    .eq('project_id', id)

  const existingUrls = new Set((existingRows ?? []).map((item) => item.url))
  if (existingError) {
    notices.push('기존 등록 산출물과의 중복 확인에 실패했습니다.')
  }
  const rawResults = await Promise.all(
    platforms.map(async (platform) => {
      const query = `${PLATFORM_QUERIES[platform].join(' OR ')} ${keyword} 한국`
      try {
        const rows = await searchDuckDuckGo(query, 6)
        if (rows.length === 0) {
          notices.push(`${platform.toUpperCase()}에서 검색 결과를 찾지 못했습니다.`)
        }
        return rows.map((row) => ({ ...row, platform }))
      } catch {
        notices.push(`${platform.toUpperCase()} 검색 중 오류가 발생했습니다.`)
        return []
      }
    })
  )

  const uniqueUrls = Array.from(new Map(rawResults.flat().map((item) => [item.url, item])).values())
  const parsedResults = await Promise.all(
    uniqueUrls.map(async (item, index) => {
      try {
        const parsed = await parseDeliverableUrl(item.url)
        const platformPriority = PLATFORM_PRIORITY[item.platform]
        return {
          ...parsed,
          title: parsed.title || item.title || `${keyword} 검색 결과`,
          is_registered: existingUrls.has(item.url),
          platform_priority: platformPriority,
          recommended_score: getRecommendedScore(parsed, item.platform),
          key: `${item.platform}-${index}`,
        } satisfies SearchCandidate
      } catch {
        notices.push(`${item.url} 파싱에 실패해 기본 정보로 등록합니다.`)
        const fallback = {
          platform: item.platform,
          url: item.url,
          title: item.title || `${keyword} 검색 결과`,
          thumbnail_url: null,
          published_at: null,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          parsed_fields: {
            title: !!item.title,
            thumbnail: false,
            stats: false,
            published_at: false,
          },
          notice: '원본 링크 메타데이터를 불러오지 못했습니다. 등록 후 수동 보정해주세요.',
        } satisfies ParsedDeliverable
        return {
          ...fallback,
          is_registered: existingUrls.has(item.url),
          platform_priority: PLATFORM_PRIORITY[item.platform],
          recommended_score: getRecommendedScore(fallback, item.platform),
          key: `${item.platform}-${index}`,
        } satisfies SearchCandidate
      }
    })
  )

  parsedResults.sort((a, b) => {
    if (a.is_registered !== b.is_registered) return Number(a.is_registered) - Number(b.is_registered)
    if (a.recommended_score !== b.recommended_score) return b.recommended_score - a.recommended_score
    if (a.published_at && b.published_at) return b.published_at.localeCompare(a.published_at)
    return a.title.localeCompare(b.title, 'ko')
  })

  if (parsedResults.length === 0) {
    notices.push('검색 결과가 없거나 검색 엔진 응답이 제한되었습니다. 서버 네트워크 또는 외부 검색엔진 차단 여부를 확인해주세요.')
  } else if (parsedResults.some((item) => item.is_registered)) {
    notices.push('이미 등록된 산출물도 함께 표시됩니다. 신규 후보 위주로 선택하세요.')
  }

  const payload = { results: parsedResults, notices }
  if (parsedResults.length > 0) {
    writeCachedSearch(cacheKey, payload)
  }

  return NextResponse.json(payload)
}
