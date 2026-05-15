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
