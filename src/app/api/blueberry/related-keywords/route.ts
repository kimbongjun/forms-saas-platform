import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const CACHE = new Map<string, { data: RelatedKeywordMap; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000
const TREND_WINDOW_DAYS = 30

export type RelatedKeywordData = {
  monthlyPc: number | null
  monthlyMobile: number | null
  blogCount: number
  contentCount: number
  trendRatio: number
  ctrScore: number
  lexicalScore: number
  saturationScore: number
  relevanceScore: number
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
      result[key] = {
        pc: parseQcCnt(row.monthlyPcQcCnt),
        mobile: parseQcCnt(row.monthlyMobileQcCnt),
      }
    }
    return result
  } catch {
    return {}
  }
}

async function fetchSearchTotal(
  keyword: string,
  type: 'blog' | 'cafearticle' | 'news' | 'kin' | 'shop',
  clientId: string,
  clientSecret: string
) {
  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(keyword)}&display=1`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!response.ok) return 0
    const json = (await response.json()) as { total?: number }
    return json.total ?? 0
  } catch {
    return 0
  }
}

async function fetchContentSignals(keyword: string, clientId: string, clientSecret: string) {
  const [blog, cafe, news, kin] = await Promise.all([
    fetchSearchTotal(keyword, 'blog', clientId, clientSecret),
    fetchSearchTotal(keyword, 'cafearticle', clientId, clientSecret),
    fetchSearchTotal(keyword, 'news', clientId, clientSecret),
    fetchSearchTotal(keyword, 'kin', clientId, clientSecret),
  ])

  return {
    blogCount: blog,
    contentCount: blog + cafe + news + kin,
  }
}

async function fetchDatalabTrends(
  keywords: string[],
  clientId: string,
  clientSecret: string
): Promise<Record<string, number>> {
  if (keywords.length === 0) return {}

  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - TREND_WINDOW_DAYS * 2)

  const format = (date: Date) => date.toISOString().slice(0, 10)
  const result: Record<string, number> = {}
  const batchSize = 5

  for (let index = 0; index < keywords.length; index += batchSize) {
    const batch = keywords.slice(index, index + batchSize)

    try {
      const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
        method: 'POST',
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: format(startDate),
          endDate: format(today),
          timeUnit: 'date',
          keywordGroups: batch.map((keyword) => ({ groupName: keyword, keywords: [keyword] })),
        }),
        signal: AbortSignal.timeout(12000),
      })

      if (!response.ok) continue

      const json = (await response.json()) as {
        results?: { title: string; data: { ratio: number }[] }[]
      }

      for (const item of json.results ?? []) {
        const data = item.data ?? []
        if (data.length < TREND_WINDOW_DAYS * 2) {
          result[item.title] = 1
          continue
        }

        const previousWindow = data.slice(-TREND_WINDOW_DAYS * 2, -TREND_WINDOW_DAYS)
        const currentWindow = data.slice(-TREND_WINDOW_DAYS)
        const previousAverage =
          previousWindow.reduce((sum, point) => sum + point.ratio, 0) / Math.max(previousWindow.length, 1)
        const currentAverage =
          currentWindow.reduce((sum, point) => sum + point.ratio, 0) / Math.max(currentWindow.length, 1)

        result[item.title] = previousAverage > 0 ? Number((currentAverage / previousAverage).toFixed(2)) : 1
      }
    } catch {
      continue
    }
  }

  return result
}

function computeScores(seedKeyword: string, keyword: string, volume: number, contentCount: number, trendRatio: number) {
  const lexicalScore = computeLexicalScore(seedKeyword, keyword)
  const volumeScore = Math.min(1, Math.log10(Math.max(volume, 10)) / 5)
  const saturationRatio = contentCount / Math.max(volume, 1)
  const saturationScore = Math.max(0, 1 - Math.min(1, saturationRatio / 12))
  const ctrScore = Math.max(0, Math.min(1, volumeScore * 0.55 + saturationScore * 0.45))
  const trendScore = Math.max(0, Math.min(1, (trendRatio - 0.7) / 0.9))

  const hardPenalty = lexicalScore < 0.2 ? 0.55 : 1
  const relevanceScore = Number(
    (
      (lexicalScore * 0.4 + volumeScore * 0.22 + ctrScore * 0.23 + trendScore * 0.15) *
      100 *
      hardPenalty
    ).toFixed(1)
  )

  return {
    lexicalScore: Number(lexicalScore.toFixed(3)),
    saturationScore: Number(saturationScore.toFixed(3)),
    ctrScore: Number(ctrScore.toFixed(3)),
    relevanceScore,
  }
}

export async function POST(req: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET is not configured.' }, { status: 503 })
  }

  const { keywords, seedKeyword } = (await req.json()) as { keywords?: string[]; seedKeyword?: string }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'keywords array is required.' }, { status: 400 })
  }

  const normalizedKeywords = keywords.map((keyword) => keyword.trim().normalize('NFC')).filter(Boolean)
  const normalizedSeedKeyword = seedKeyword?.trim().normalize('NFC') || normalizedKeywords[0] || ''
  const cacheKey = [normalizedSeedKeyword, ...normalizedKeywords].sort().join('|')
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  const adCustomerId = process.env.NAVER_AD_CUSTOMER_ID?.trim()
  const adAccessLicense = process.env.NAVER_AD_ACCESS_LICENSE?.trim()
  const adSecretKey = process.env.NAVER_AD_SECRET_KEY?.trim()
  const hasAdApi = Boolean(adCustomerId && adAccessLicense && adSecretKey)

  const adVolumePromise = hasAdApi
    ? fetchBatchAdVolume(normalizedKeywords, adCustomerId!, adAccessLicense!, adSecretKey!)
    : Promise.resolve({})

  const trendPromise = fetchDatalabTrends(normalizedKeywords.slice(0, 12), clientId, clientSecret)
  const contentPromises = normalizedKeywords.map((keyword) => fetchContentSignals(keyword, clientId, clientSecret))

  const [adVolumes, trends, ...contents] = await Promise.all([adVolumePromise, trendPromise, ...contentPromises])

  const result: RelatedKeywordMap = {}
  normalizedKeywords.forEach((keyword, index) => {
    const ad = (adVolumes as Record<string, { pc: number; mobile: number }>)[keyword]
    const contentSignal = (contents[index] as Awaited<ReturnType<typeof fetchContentSignals>>) ?? {
      blogCount: 0,
      contentCount: 0,
    }
    const volume = (ad?.pc ?? 0) + (ad?.mobile ?? 0)
    const trendRatio = (trends as Record<string, number>)[keyword] ?? 1
    const scores = computeScores(normalizedSeedKeyword, keyword, volume, contentSignal.contentCount, trendRatio)

    result[keyword] = {
      monthlyPc: ad?.pc ?? null,
      monthlyMobile: ad?.mobile ?? null,
      blogCount: contentSignal.blogCount,
      contentCount: contentSignal.contentCount,
      trendRatio,
      ctrScore: scores.ctrScore,
      lexicalScore: scores.lexicalScore,
      saturationScore: scores.saturationScore,
      relevanceScore: scores.relevanceScore,
    }
  })

  CACHE.set(cacheKey, { data: result, ts: Date.now() })
  return NextResponse.json(result)
}
