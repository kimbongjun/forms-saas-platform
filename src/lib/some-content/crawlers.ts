// 소셜 빅데이터 커뮤니티 크롤러
// - DCInside, 뽐뿌: fetch + regex HTML 파싱 (공식 API 미지원)
// - 강남언니, 바비톡: 내부 API 엔드포인트 시도 (비공식, 변경 가능성 있음)

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
}

export interface CrawledPost {
  channel: string
  title: string
  content: string | null
  url: string
  author: string | null
  published_at: string | null
}

async function fetchText(url: string, extra: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { ...DEFAULT_HEADERS, ...extra },
      signal: AbortSignal.timeout(8000),
      // Next.js 캐시 비활성화 (항상 최신 데이터)
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn(`[Crawler] ${url} → ${res.status}`)
      return null
    }
    return await res.text()
  } catch (e) {
    console.warn(`[Crawler] fetch failed: ${url}`, e)
    return null
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── DCInside 검색 크롤러 ─────────────────────────────────────────
// URL: https://search.dcinside.com/post/p/1/q/{keyword}
export async function crawlDcinside(keyword: string): Promise<CrawledPost[]> {
  const url = `https://search.dcinside.com/post/p/1/q/${encodeURIComponent(keyword)}`
  const html = await fetchText(url)
  if (!html) return []

  const posts: CrawledPost[] = []

  // DCInside search result: <a class="tit_txt" href="...">Title</a>
  const linkRe = /href="(https:\/\/(?:gall|m\.dcinside\.com)[^"]+)"[^>]*class="tit_txt"[^>]*>([\s\S]*?)<\/a>/g
  const altRe  = /class="tit_txt"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  const dateRe  = /class="date_time"[^>]*>([^<]+)<\/span>/g
  const gallRe  = /class="gall_name"[^>]*>([\s\S]*?)<\/span>/g

  const dates: string[] = []
  let dm
  while ((dm = dateRe.exec(html)) !== null) dates.push(dm[1].trim())

  const galls: string[] = []
  let gm
  while ((gm = gallRe.exec(html)) !== null) galls.push(decodeHtmlEntities(gm[1]))

  let re = linkRe
  let m
  let idx = 0
  while ((m = re.exec(html)) !== null && idx < 10) {
    const rawUrl = m[1]
    const title = decodeHtmlEntities(m[2])
    if (!title || title.length < 2) continue
    posts.push({
      channel: 'dcinside',
      title,
      content: galls[idx] ? `${galls[idx]} 갤러리` : null,
      url: rawUrl,
      author: null,
      published_at: dates[idx] ? (() => { try { return new Date(dates[idx]).toISOString() } catch { return null } })() : null,
    })
    idx++
  }

  // Fallback: try alternate pattern
  if (posts.length === 0) {
    idx = 0
    while ((m = altRe.exec(html)) !== null && idx < 10) {
      const rawUrl = m[1]
      const title = decodeHtmlEntities(m[2])
      if (!title || title.length < 2) continue
      const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://gall.dcinside.com${rawUrl}`
      posts.push({
        channel: 'dcinside',
        title,
        content: null,
        url: fullUrl,
        author: null,
        published_at: dates[idx] ?? null,
      })
      idx++
    }
  }

  return posts
}

// ── 뽐뿌 검색 크롤러 ─────────────────────────────────────────────
// URL: https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu&sfl=subject&stx={keyword}
export async function crawlPpomppu(keyword: string): Promise<CrawledPost[]> {
  const url = `https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu&sfl=subject&stx=${encodeURIComponent(keyword)}`
  const html = await fetchText(url, { Referer: 'https://www.ppomppu.co.kr' })
  if (!html) return []

  const posts: CrawledPost[] = []

  // 뽐뿌 table row: id="normalItem_XXXXX"
  const rowRe = /id="normalItem_\d+"[\s\S]*?<a[^>]+href="(\/zboard\/view\.php[^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/tr>/g
  const dateRe = /<td[^>]*class="date[^"]*"[^>]*>([^<]+)<\/td>/g

  const dates: string[] = []
  let dm
  while ((dm = dateRe.exec(html)) !== null) dates.push(dm[1].trim())

  let m
  let idx = 0
  while ((m = rowRe.exec(html)) !== null && idx < 10) {
    const path = m[1]
    const title = decodeHtmlEntities(m[2])
    if (!title || title.length < 2) continue
    posts.push({
      channel: 'ppomppu',
      title,
      content: null,
      url: `https://www.ppomppu.co.kr${path}`,
      author: null,
      published_at: dates[idx] ? (() => { try { return new Date(dates[idx]).toISOString() } catch { return null } })() : null,
    })
    idx++
  }

  return posts
}

// ── 강남언니 내부 API 시도 ─────────────────────────────────────────
// 강남언니 앱 내부 API를 시도합니다 (비공식, 서비스 정책에 따라 차단될 수 있음)
export async function crawlGangnamUnnie(keyword: string): Promise<CrawledPost[]> {
  // 시도 1: 커뮤니티 스토리 검색
  const url = `https://www.gangnamunni.com/api/community/story/list?keyword=${encodeURIComponent(keyword)}&page=0&size=10`
  const text = await fetchText(url, { Accept: 'application/json', Referer: 'https://www.gangnamunni.com' })
  if (!text) return []

  try {
    const json = JSON.parse(text) as {
      content?: { id: number; title: string; body?: string; createdAt?: string }[]
    }
    return (json.content ?? []).slice(0, 10).map(item => ({
      channel: 'gangnam_unnie',
      title: item.title ?? '',
      content: item.body ? item.body.replace(/<[^>]+>/g, '').slice(0, 200) : null,
      url: `https://www.gangnamunni.com/community/story/${item.id}`,
      author: null,
      published_at: item.createdAt ?? null,
    }))
  } catch {
    return []
  }
}

// ── 바비톡 내부 API 시도 ──────────────────────────────────────────
export async function crawlBabitalk(keyword: string): Promise<CrawledPost[]> {
  const url = `https://www.babitalk.com/api/v2/community/posts?keyword=${encodeURIComponent(keyword)}&page=1&limit=10`
  const text = await fetchText(url, { Accept: 'application/json', Referer: 'https://www.babitalk.com' })
  if (!text) return []

  try {
    const json = JSON.parse(text) as {
      data?: {
        id: number
        title: string
        content?: string
        createdAt?: string
        author?: { nickname?: string }
      }[]
    }
    return (json.data ?? []).slice(0, 10).map(item => ({
      channel: 'babitalk',
      title: item.title ?? '',
      content: item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 200) : null,
      url: `https://www.babitalk.com/community/post/${item.id}`,
      author: item.author?.nickname ?? null,
      published_at: item.createdAt ?? null,
    }))
  } catch {
    return []
  }
}

// ── YouTube Data API v3 ────────────────────────────────────────────
// YOUTUBE_API_KEY 환경변수 필요
export async function fetchYouTubePosts(
  keyword: string,
  apiKey: string,
): Promise<CrawledPost[]> {
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet` +
    `&q=${encodeURIComponent(keyword)}&type=video&maxResults=5&order=date` +
    `&key=${apiKey}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json() as {
      items?: {
        id: { videoId: string }
        snippet: { title: string; channelTitle: string; publishedAt: string; description: string }
      }[]
    }
    return (json.items ?? []).map(item => ({
      channel: 'youtube',
      title: decodeHtmlEntities(item.snippet.title),
      content: decodeHtmlEntities(item.snippet.description).slice(0, 200) || null,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      author: item.snippet.channelTitle,
      published_at: item.snippet.publishedAt,
    }))
  } catch (e) {
    console.warn('[Crawler/YouTube] error:', e)
    return []
  }
}

// ── YouTube 검색 결과 수 ───────────────────────────────────────────
export async function fetchYouTubeCount(keyword: string, apiKey: string): Promise<number> {
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=id` +
    `&q=${encodeURIComponent(keyword)}&type=video&maxResults=1` +
    `&key=${apiKey}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), cache: 'no-store' })
    if (!res.ok) return 0
    const json = await res.json() as { pageInfo?: { totalResults?: number } }
    return json.pageInfo?.totalResults ?? 0
  } catch {
    return 0
  }
}

// ── 에펨코리아 검색 크롤러 ────────────────────────────────────────
// URL: https://www.fmkorea.com/search.php?act=IS&where=document&is_keyword={keyword}
export async function crawlFmkorea(keyword: string): Promise<CrawledPost[]> {
  const url = `https://www.fmkorea.com/search.php?act=IS&where=document&is_keyword=${encodeURIComponent(keyword)}&page=1`
  const html = await fetchText(url, { Referer: 'https://www.fmkorea.com' })
  if (!html) return []

  const posts: CrawledPost[] = []

  // FM코리아: <h3 class="title"><a href="/XXXXX">title</a></h3>
  const titleRe = /<h3[^>]*class="[^"]*title[^"]*"[^>]*>[\s\S]*?<a[^>]+href="(\/[0-9]+)"[^>]*>([\s\S]*?)<\/a>/g
  const dateRe  = /class="time"[^>]*>([^<]+)<\/span>/g

  const dates: string[] = []
  let dm
  while ((dm = dateRe.exec(html)) !== null) dates.push(dm[1].trim())

  let m
  let idx = 0
  while ((m = titleRe.exec(html)) !== null && idx < 10) {
    const path = m[1]
    const title = decodeHtmlEntities(m[2])
    if (!title || title.length < 2) continue
    posts.push({
      channel: 'fmkorea',
      title,
      content: null,
      url: `https://www.fmkorea.com${path}`,
      author: null,
      published_at: dates[idx] ? (() => { try { return new Date(dates[idx]).toISOString() } catch { return null } })() : null,
    })
    idx++
  }

  // Fallback pattern
  if (posts.length === 0) {
    const altRe = /href="(https?:\/\/www\.fmkorea\.com\/[0-9]+)"[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>/g
    let am
    let aidx = 0
    while ((am = altRe.exec(html)) !== null && aidx < 10) {
      const title = decodeHtmlEntities(am[2])
      if (!title || title.length < 2) continue
      posts.push({ channel: 'fmkorea', title, content: null, url: am[1], author: null, published_at: null })
      aidx++
    }
  }

  return posts
}

// ── 더쿠 검색 크롤러 ──────────────────────────────────────────────
// URL: https://theqoo.net/index.php?mid=hot&search_keyword={keyword}&search_target=all
export async function crawlTheqoo(keyword: string): Promise<CrawledPost[]> {
  const url = `https://theqoo.net/index.php?mid=hot&search_keyword=${encodeURIComponent(keyword)}&search_target=all&listStyle=list&page=1`
  const html = await fetchText(url, { Referer: 'https://theqoo.net' })
  if (!html) return []

  const posts: CrawledPost[] = []

  // 더쿠: <a class="title" href="...">title</a>
  const titleRe = /<a[^>]+class="[^"]*title[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  const dateRe  = /<span[^>]*class="[^"]*date[^"]*"[^>]*>([^<]+)<\/span>/g

  const dates: string[] = []
  let dm
  while ((dm = dateRe.exec(html)) !== null) dates.push(dm[1].trim())

  let m
  let idx = 0
  while ((m = titleRe.exec(html)) !== null && idx < 10) {
    const rawUrl = m[1]
    const title = decodeHtmlEntities(m[2])
    if (!title || title.length < 2) continue
    const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://theqoo.net${rawUrl}`
    posts.push({
      channel: 'theqoo',
      title,
      content: null,
      url: fullUrl,
      author: null,
      published_at: dates[idx] ? (() => { try { return new Date(dates[idx]).toISOString() } catch { return null } })() : null,
    })
    idx++
  }

  // Fallback: li > a with href containing theqoo.net
  if (posts.length === 0) {
    const altRe = /href="(https?:\/\/theqoo\.net\/[^"?]+)"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/g
    let am
    let aidx = 0
    while ((am = altRe.exec(html)) !== null && aidx < 10) {
      const title = decodeHtmlEntities(am[2])
      if (!title || title.length < 2) continue
      posts.push({ channel: 'theqoo', title, content: null, url: am[1], author: null, published_at: null })
      aidx++
    }
  }

  return posts
}

// ── 성예사 (성형예쁜사람들) 네이버 카페 크롤러 ─────────────────────────
// Naver 카페 검색 API 사용 (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET)
export async function crawlSungyesa(keyword: string): Promise<CrawledPost[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) return []

  const query = `성형예쁜사람들 ${keyword}`
  const url = `https://openapi.naver.com/v1/search/cafearticle.json?query=${encodeURIComponent(query)}&display=10&sort=date`
  const text = await fetchText(url, {
    'X-Naver-Client-Id': clientId,
    'X-Naver-Client-Secret': clientSecret,
  })
  if (!text) return []

  try {
    const json = JSON.parse(text) as {
      items?: { title: string; description: string; link: string; postdate: string }[]
    }
    return (json.items ?? []).slice(0, 10).map(item => ({
      channel: 'sungyesa',
      title: decodeHtmlEntities(item.title),
      content: decodeHtmlEntities(item.description),
      url: item.link,
      author: null,
      published_at: item.postdate?.length === 8
        ? `${item.postdate.slice(0, 4)}-${item.postdate.slice(4, 6)}-${item.postdate.slice(6, 8)}`
        : null,
    }))
  } catch { return [] }
}

// ── 전체 크롤링 실행 ──────────────────────────────────────────────
export async function crawlAllCommunity(keyword: string): Promise<CrawledPost[]> {
  const results = await Promise.allSettled([
    crawlDcinside(keyword),
    crawlPpomppu(keyword),
    crawlGangnamUnnie(keyword),
    crawlBabitalk(keyword),
    crawlFmkorea(keyword),
    crawlTheqoo(keyword),
    crawlSungyesa(keyword),
  ])
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}
