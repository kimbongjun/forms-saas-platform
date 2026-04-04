import type { ParsedClipping } from '@/features/clippings/types'

const REQUEST_TIMEOUT_MS = 8000

function getTimeoutSignal() {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  }
  return undefined
}

async function fetchWithTimeout(input: string | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? getTimeoutSignal(),
  })
}

function extractMeta(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const byProperty =
    html.match(new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, 'i'))
  if (byProperty?.[1]) return byProperty[1]

  const byName =
    html.match(new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["']`, 'i'))
  return byName?.[1] ?? null
}

function normalizeDate(value: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10)

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toISOString().slice(0, 10)
}

export async function parseClippingUrl(url: string): Promise<ParsedClipping> {
  const base: ParsedClipping = {
    title: '',
    url,
    source: null,
    published_at: null,
    description: null,
    thumbnail_url: null,
    notice: null,
  }

  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/html',
      },
      redirect: 'follow',
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return { ...base, notice: `페이지를 불러오지 못했습니다: HTTP ${res.status}` }
    }

    const html = await res.text()
    const title =
      extractMeta(html, 'og:title') ??
      extractMeta(html, 'twitter:title') ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
      ''
    const description =
      extractMeta(html, 'og:description') ??
      extractMeta(html, 'twitter:description') ??
      extractMeta(html, 'description')
    const thumbnail =
      extractMeta(html, 'og:image') ??
      extractMeta(html, 'twitter:image')
    const source =
      extractMeta(html, 'og:site_name') ??
      extractMeta(html, 'application-name')
    const publishedAt = normalizeDate(
      extractMeta(html, 'article:published_time') ??
      extractMeta(html, 'og:article:published_time') ??
      extractMeta(html, 'pubdate') ??
      extractMeta(html, 'date')
    )

    return {
      ...base,
      title,
      source,
      description,
      thumbnail_url: thumbnail,
      published_at: publishedAt,
    }
  } catch (error) {
    return {
      ...base,
      notice: `페이지를 불러오지 못했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
