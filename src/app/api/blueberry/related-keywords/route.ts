import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

type Period = '5y' | '3y' | '2y' | '1y' | '3m' | '1m'

// 기간별 캐시 (키: period|sorted keywords)
const CACHE = new Map<string, { data: RelatedKeywordMap; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000

export type RelatedKeywordData = {
  monthlyPc: number | null
  monthlyMobile: number | null
  blogCount: number
  /** DataLab 기반 해당 기간 트렌드 비율. avg(후반) / avg(전반). 1.0 = 변화없음, >1 = 상승 */
  trendRatio: number
}

export type RelatedKeywordMap = Record<string, RelatedKeywordData>

function parseQcCnt(value: number | string | undefined | null) {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Math.round(value)
  const trimmed = String(value).trim()
  if (trimmed.startsWith('<')) return 0
  const parsed = parseInt(trimmed.replace(/,/g, ''), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

function normalizeKeyword(value: string) {
  return value.trim().normalize('NFC').toLowerCase()
}

function tokenize(value: string) {
  return normalizeKeyword(value)
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0)
}

function buildCharacterBigrams(value: string) {
  const normalized = normalizeKeyword(value).replace(/\s+/g, '')
  const result = new Set<string>()
  for (let i = 0; i < normalized.length - 1; i += 1) {
    result.add(normalized.slice(i, i + 2))
  }
  return result
}

function computeLexicalScore(seedKeyword: string, candidateKeyword: string) {
  const seed = normalizeKeyword(seedKeyword)
  const candidate = normalizeKeyword(candidateKeyword)
  if (!seed || !candidate) return 0
  if (seed === candidate) return 1

  const directContainment = candidate.includes(seed) ? 1 : seed.includes(candidate) ? 0.8 : 0

  const seedTokens = tokenize(seedKeyword)
  const candidateTokens = tokenize(candidateKeyword)
  const seedTokenSet = new Set(seedTokens)
  const candidateTokenSet = new Set(candidateTokens)
  const overlapCount = [...candidateTokenSet].filter((token) => seedTokenSet.has(token)).length
  const tokenOverlap =
    seedTokenSet.size === 0 && candidateTokenSet.size === 0
      ? 0
      : overlapCount / Math.max(seedTokenSet.size, candidateTokenSet.size, 1)

  const seedBigrams = buildCharacterBigrams(seedKeyword)
  const candidateBigrams = buildCharacterBigrams(candidateKeyword)
  const bigramOverlapCount = [...candidateBigrams].filter((token) => seedBigrams.has(token)).length
  const bigramScore =
    seedBigrams.size === 0 && candidateBigrams.size === 0
      ? 0
      : bigramOverlapCount / Math.max(seedBigrams.size, candidateBigrams.size, 1)

  return Math.max(directContainment, 0.55 * tokenOverlap + 0.45 * bigramScore)
}

async function fetchBatchAdVolume(
  keywords: string[],
  customerId: string,
  accessLicense: string,
  secretKey: string
): Promise<Record<string, { pc: number; mobile: number }>> {
  const timestamp = Date.now()
  const method = 'GET'
  const path = '/keywordstool'
  const message = `${timestamp}.${method}.${path}`
  const signature = createHmac('sha256', secretKey).update(message).digest('base64')
  try {
    const hintParam = keywords.map((keyword) => encodeURIComponent(keyword)).join(',')
    const response = await fetch(`https://api.naver.com${path}?hintKeywords=${hintParam}&showDetail=1`, {
      headers: {
        'X-Timestamp': String(timestamp),
        'X-API-KEY': accessLicense,
        'X-Customer': customerId,
        'X-Signature': signature,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return {}

    const json = (await response.json()) as {
      keywordList?: { relKeyword: string; monthlyPcQcCnt: number | string; monthlyMobileQcCnt: number | string }[]
    }
    const result: Record<string, { pc: number; mobile: number }> = {}
    for (const row of json.keywordList ?? []) {
      const key = row.relKeyword.trim().normalize('NFC')
      result[key] = { pc: parseQcCnt(row.monthlyPcQcCnt), mobile: parseQcCnt(row.monthlyMobileQcCnt) }
    }
    return result
  } catch { return {} }
}

async function fetchBlogCount(keyword: string, clientId: string, clientSecret: string): Promise<number> {
  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(keyword)}&display=1`,
      {
        headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!response.ok) return 0
    const json = (await response.json()) as { total?: number }
    return json.total ?? 0
  } catch { return 0 }
}

// ── 기간에 따라 DataLab 날짜 범위 결정 ──────────────────────────
// DataLab으로 기간 내 트렌드 비율(후반/전반)을 계산하기 위해
// period에 맞는 startDate/endDate와 timeUnit을 반환
function getPeriodRange(period: Period): { startDate: string; endDate: string; timeUnit: 'date' | 'week' | 'month' } {
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  let days: number
  let timeUnit: 'date' | 'week' | 'month' = 'date'
  switch (period) {
    case '1m':  days = 60;  timeUnit = 'date';  break
    case '3m':  days = 180; timeUnit = 'week';  break
    case '1y':  days = 365; timeUnit = 'month'; break
    case '2y':  days = 730; timeUnit = 'month'; break
    case '3y':  days = 1095; timeUnit = 'month'; break
    case '5y':  days = 1825; timeUnit = 'month'; break
    default:    days = 60;  timeUnit = 'date';  break
  }

  const start = new Date(yesterday.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  return { startDate: fmt(start), endDate: fmt(yesterday), timeUnit }
}

// ── DataLab 기간 트렌드 (5개씩 배치 병렬 처리) ─────────────────
async function fetchKeywordTrends(
  keywords: string[],
  clientId: string,
  clientSecret: string,
  period: Period,
): Promise<Record<string, number>> {
  if (keywords.length === 0) return {}
  const { startDate, endDate, timeUnit } = getPeriodRange(period)
  const trends: Record<string, number> = {}
  const batchSize = 5

  const batches: string[][] = []
  for (let i = 0; i < keywords.length; i += batchSize) batches.push(keywords.slice(i, i + batchSize))

  await Promise.all(batches.map(async (batch) => {
    try {
      const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
        method: 'POST',
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          startDate, endDate, timeUnit,
          keywordGroups: batch.map(kw => ({ groupName: kw, keywords: [kw] })),
        }),
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) return
      const json = await res.json() as {
        results?: { title: string; data: { period: string; ratio: number }[] }[]
      }
      for (const result of json.results ?? []) {
        const data = result.data ?? []
        if (data.length < 2) { trends[result.title] = 1; continue }
        const half = Math.floor(data.length / 2)
        const avg = (arr: { ratio: number }[]) => arr.reduce((s, d) => s + d.ratio, 0) / arr.length
        const prevAvg = avg(data.slice(0, half))
        const recentAvg = avg(data.slice(half))
        trends[result.title] = prevAvg > 0 ? recentAvg / prevAvg : 1
      }
    } catch { /* DataLab 실패 → trendRatio = 1 */ }
  }))

  return trends
}

export async function POST(req: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET is not configured.' }, { status: 503 })
  }

  const body = await req.json() as { keywords?: string[]; period?: Period }
  const { keywords } = body
  const period: Period = body.period ?? '1m'

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'keywords array is required.' }, { status: 400 })
  }

  const normalized = keywords.map(k => k.trim().normalize('NFC')).filter(Boolean)
  const cacheKey = `${period}|${[...normalized].sort().join('|')}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  const adCustomerId = process.env.NAVER_AD_CUSTOMER_ID?.trim()
  const adAccessLicense = process.env.NAVER_AD_ACCESS_LICENSE?.trim()
  const adSecretKey = process.env.NAVER_AD_SECRET_KEY?.trim()
  const hasAdApi = Boolean(adCustomerId && adAccessLicense && adSecretKey)

  const [adVolumes, trendMap, ...blogCounts] = await Promise.all([
    hasAdApi
      ? fetchBatchAdVolume(normalized, adCustomerId!, adAccessLicense!, adSecretKey!)
      : Promise.resolve({}),
    // DataLab은 보조 지표 — 실패해도 무시 (trendRatio = 1)
    fetchKeywordTrends(normalized, clientId, clientSecret, period),
    ...normalized.map(kw => fetchBlogCount(kw, clientId, clientSecret)),
  ])

  const result: RelatedKeywordMap = {}
  normalized.forEach((kw, i) => {
    const ad = (adVolumes as Record<string, { pc: number; mobile: number }>)[kw]
    result[kw] = {
      monthlyPc: ad?.pc ?? null,
      monthlyMobile: ad?.mobile ?? null,
      blogCount: (blogCounts[i] as number) ?? 0,
      trendRatio: (trendMap as Record<string, number>)[kw] ?? 1,
    }
  })

  CACHE.set(cacheKey, { data: result, ts: Date.now() })
  return NextResponse.json(result)
}
