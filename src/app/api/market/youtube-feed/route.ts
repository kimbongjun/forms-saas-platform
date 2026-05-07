import { NextResponse } from 'next/server'

export type YouTubeVideo = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  publishedAt: string
  videoUrl: string
}

type CacheEntry = {
  expiresAt: number
  videos: YouTubeVideo[]
}

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string
    }
    snippet?: {
      title?: string
      description?: string
      channelTitle?: string
      publishedAt?: string
      thumbnails?: {
        high?: { url?: string }
        medium?: { url?: string }
        default?: { url?: string }
      }
    }
  }>
  error?: {
    message?: string
  }
}

const CACHE_TTL_MS = 2 * 60 * 60 * 1000
const cache = new Map<string, CacheEntry>()

function normalizeMaxResults(value: string | null) {
  const parsed = Number(value ?? '6')
  if (!Number.isFinite(parsed)) return 6
  return Math.min(12, Math.max(1, Math.floor(parsed)))
}

function buildCacheKey(query: string, maxResults: number) {
  return `${query.toLowerCase()}::${maxResults}`
}

function pruneExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      cache.delete(key)
    }
  }
}

export async function GET(request: Request) {
  pruneExpiredEntries()

  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''
  const maxResults = normalizeMaxResults(url.searchParams.get('maxResults'))
  const apiKey = process.env.YOUTUBE_DATA_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      videos: [],
      configured: false,
      error: 'YOUTUBE_DATA_API_KEY is not configured.',
    })
  }

  if (!query) {
    return NextResponse.json({
      videos: [],
      configured: true,
      error: 'Missing q query parameter.',
    })
  }

  const cacheKey = buildCacheKey(query, maxResults)
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({
      videos: cached.videos,
      configured: true,
      fromCache: true,
    })
  }

  try {
    const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    youtubeUrl.searchParams.set('part', 'snippet')
    youtubeUrl.searchParams.set('type', 'video')
    youtubeUrl.searchParams.set('order', 'relevance')
    youtubeUrl.searchParams.set('safeSearch', 'moderate')
    youtubeUrl.searchParams.set('maxResults', String(maxResults))
    youtubeUrl.searchParams.set('q', query)
    youtubeUrl.searchParams.set('key', apiKey)

    const response = await fetch(youtubeUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    const payload = (await response.json()) as YouTubeSearchResponse

    if (!response.ok) {
      return NextResponse.json(
        {
          videos: [],
          configured: true,
          error: payload.error?.message ?? 'YouTube API request failed.',
        },
        { status: response.status },
      )
    }

    const videos = (payload.items ?? [])
      .map((item): YouTubeVideo | null => {
        const videoId = item.id?.videoId
        if (!videoId) return null

        const snippet = item.snippet
        const thumbnailUrl =
          snippet?.thumbnails?.high?.url ??
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.default?.url ??
          ''

        return {
          id: videoId,
          title: snippet?.title ?? 'Untitled video',
          description: snippet?.description ?? '',
          thumbnailUrl,
          channelTitle: snippet?.channelTitle ?? 'Unknown channel',
          publishedAt: snippet?.publishedAt ?? '',
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        }
      })
      .filter((item): item is YouTubeVideo => item !== null)

    cache.set(cacheKey, {
      videos,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return NextResponse.json({
      videos,
      configured: true,
      fromCache: false,
    })
  } catch {
    return NextResponse.json(
      {
        videos: [],
        configured: true,
        error: 'Unexpected error while fetching YouTube videos.',
      },
      { status: 500 },
    )
  }
}
