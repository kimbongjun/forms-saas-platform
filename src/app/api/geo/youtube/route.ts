import { NextRequest, NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export interface YouTubeVideo {
  videoId: string
  title: string
  thumbnail: string
  published_at: string
  channel_title: string
  view_count?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'q 파라미터 필수' }, { status: 400 })

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API 키 미설정' }, { status: 500 })
  }

  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('q', q)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', '6')
    searchUrl.searchParams.set('order', 'relevance')
    searchUrl.searchParams.set('regionCode', 'KR')
    searchUrl.searchParams.set('relevanceLanguage', 'ko')
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY)

    const searchRes = await fetch(searchUrl.toString(), { next: { revalidate: 3600 } })
    if (!searchRes.ok) {
      const errBody = await searchRes.text()
      throw new Error(`YouTube search API ${searchRes.status}: ${errBody}`)
    }

    const searchData = await searchRes.json() as {
      items?: Array<{
        id: { videoId: string }
        snippet: {
          title: string
          thumbnails: { medium?: { url: string }; default?: { url: string } }
          publishedAt: string
          channelTitle: string
        }
      }>
    }

    if (!searchData.items?.length) {
      return NextResponse.json({ videos: [] })
    }

    const videoIds = searchData.items.map(i => i.id.videoId).join(',')

    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    statsUrl.searchParams.set('part', 'statistics')
    statsUrl.searchParams.set('id', videoIds)
    statsUrl.searchParams.set('key', YOUTUBE_API_KEY)

    const statsRes = await fetch(statsUrl.toString(), { next: { revalidate: 3600 } })
    const statsData = statsRes.ok
      ? await statsRes.json() as { items?: Array<{ id: string; statistics: { viewCount?: string } }> }
      : { items: [] }

    const statsMap = new Map(
      (statsData.items ?? []).map(i => [i.id, i.statistics.viewCount])
    )

    const videos: YouTubeVideo[] = searchData.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? '',
      published_at: item.snippet.publishedAt,
      channel_title: item.snippet.channelTitle,
      view_count: statsMap.get(item.id.videoId),
    }))

    return NextResponse.json({ videos })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[geo/youtube] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
