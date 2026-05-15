// ── HTML Schema 파싱 ──────────────────────────────────────────────────────────

function extractTypesFromValue(value: unknown, out: Set<string>): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach(item => extractTypesFromValue(item, out))
    return
  }
  const record = value as Record<string, unknown>
  if (typeof record['@type'] === 'string') {
    out.add(record['@type'])
  } else if (Array.isArray(record['@type'])) {
    record['@type'].forEach(t => { if (typeof t === 'string') out.add(t) })
  }
  for (const v of Object.values(record)) {
    extractTypesFromValue(v, out)
  }
}

export function parseSchemaTypes(html: string): string[] {
  const types = new Set<string>()
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const data: unknown = JSON.parse(match[1])
      extractTypesFromValue(data, types)
    } catch {
      // malformed JSON-LD — skip
    }
  }
  return Array.from(types)
}

export function parseFaqSchema(html: string): boolean {
  return parseSchemaTypes(html).includes('FAQPage')
}

// ── PageSpeed Insights v5 응답 타입 ───────────────────────────────────────

export interface PageSpeedResponse {
  lighthouseResult: {
    categories: { performance: { score: number } }
    audits: {
      'largest-contentful-paint': { numericValue: number }
      'cumulative-layout-shift':  { numericValue: number }
      'is-on-https':              { score: number }
    }
  }
}

// ── PageSpeed 파싱 ───────────────────────────────────────────────────────────

export function parsePageSpeedResult(data: PageSpeedResponse): {
  mobile_score: number
  lcp_ms:       number
  cls:          number
  https:        boolean
} {
  const lr = data.lighthouseResult
  return {
    mobile_score: Math.round((lr.categories.performance.score ?? 0) * 100),
    lcp_ms:       Math.round(lr.audits['largest-contentful-paint'].numericValue ?? 0),
    cls:          parseFloat((lr.audits['cumulative-layout-shift'].numericValue ?? 0).toFixed(3)),
    https:        lr.audits['is-on-https'].score === 1,
  }
}

// ── E-E-A-T 점수 계산 ────────────────────────────────────────────────────────
// mobile(30) + https(20) + sitemap(10) + schemas(각 7점, max 35) + faq(5) = max 100

export function computeEeeatScore(metrics: {
  mobile_score: number
  https:        boolean
  sitemap:      boolean
  schema_types: string[]
  faq_schema:   boolean
}): number {
  const score =
    Math.round(metrics.mobile_score * 0.30) +
    (metrics.https   ? 20 : 0) +
    (metrics.sitemap ? 10 : 0) +
    Math.min(metrics.schema_types.length * 7, 35) +
    (metrics.faq_schema ? 5 : 0)
  return Math.min(score, 100)
}

// ── TechSnapshot 타입 ─────────────────────────────────────────────────────────

export interface TechSnapshot {
  brand_id:     string
  schema_types: string[]
  faq_schema:   boolean
  eeeat_score:  number
  lcp_ms:       number
  cls:          number
  mobile_score: number
  https:        boolean
  sitemap:      boolean
  collected_at: string
  error:        string | null
}

// ── 내부 헬퍼 ────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'GEO-Analyzer/1.0' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`HTML fetch ${res.status}: ${url}`)
  return res.text()
}

async function fetchPageSpeed(websiteUrl: string): Promise<PageSpeedResponse> {
  const apiKey = process.env.PAGESPEED_API_KEY ?? ''
  const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(websiteUrl)}&strategy=mobile&key=${apiKey}`
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`PageSpeed API ${res.status}: ${await res.text()}`)
  return res.json() as Promise<PageSpeedResponse>
}

async function checkSitemap(websiteUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(websiteUrl)
    const sitemapUrl = `${parsed.protocol}//${parsed.host}/sitemap.xml`
    const res = await fetch(sitemapUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5_000),
    })
    return res.ok
  } catch {
    return false
  }
}

// ── 메인 수집 함수 ────────────────────────────────────────────────────────────

export async function collectTechForBrand(
  brandId:    string,
  websiteUrl: string,
): Promise<TechSnapshot> {
  const errors: string[] = []

  const [htmlResult, psiResult, sitemapResult] = await Promise.allSettled([
    fetchHtml(websiteUrl),
    fetchPageSpeed(websiteUrl),
    checkSitemap(websiteUrl),
  ])

  const html = htmlResult.status === 'fulfilled' ? htmlResult.value : ''
  if (htmlResult.status === 'rejected') {
    errors.push(`HTML: ${htmlResult.reason instanceof Error ? htmlResult.reason.message : String(htmlResult.reason)}`)
  }

  const psi = psiResult.status === 'fulfilled' ? psiResult.value : null
  if (psiResult.status === 'rejected') {
    errors.push(`PSI: ${psiResult.reason instanceof Error ? psiResult.reason.message : String(psiResult.reason)}`)
  }

  const sitemap = sitemapResult.status === 'fulfilled' ? sitemapResult.value : false

  const schema_types = parseSchemaTypes(html)
  const faq_schema   = parseFaqSchema(html)
  const { lcp_ms, cls, mobile_score, https: isHttps } = psi
    ? parsePageSpeedResult(psi)
    : { lcp_ms: 0, cls: 0, mobile_score: 0, https: false }

  const eeeat_score = computeEeeatScore({ mobile_score, https: isHttps, sitemap, schema_types, faq_schema })

  return {
    brand_id:     brandId,
    schema_types,
    faq_schema,
    eeeat_score,
    lcp_ms,
    cls,
    mobile_score,
    https:        isHttps,
    sitemap,
    collected_at: new Date().toISOString(),
    error:        errors.length > 0 ? errors.join(' | ') : null,
  }
}
