import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

// 1시간 캐시 (키: sorted keywords join)
const CACHE = new Map<string, { data: RelatedKeywordMap; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000

export type RelatedKeywordData = {
  monthlyPc: number | null
  monthlyMobile: number | null
  blogCount: number
}

export type RelatedKeywordMap = Record<string, RelatedKeywordData>

function parseQcCnt(v: number | string | undefined | null): number {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Math.round(v)
  const s = String(v).trim()
  if (s.startsWith('<')) return 0
  const n = parseInt(s.replace(/,/g, ''), 10)
  return isNaN(n) ? 0 : n
}

async function fetchBatchAdVolume(
  keywords: string[],
  customerId: string,
  accessLicense: string,
  secretKey: string,
): Promise<Record<string, { pc: number; mobile: number }>> {
  const timestamp = Date.now()
  const method = 'GET'
  const path = '/keywordstool'
  const message = `${timestamp}.${method}.${path}`
  const signature = createHmac('sha256', secretKey).update(message).digest('base64')

  // Naver Ad API는 hintKeywords를 콤마로 구분된 복수 키워드 지원 (최대 100개)
  const hintParam = keywords.map(k => encodeURIComponent(k)).join(',')
  try {
    const res = await fetch(
      `https://api.naver.com${path}?hintKeywords=${hintParam}&showDetail=1`,
      {
        headers: {
          'X-Timestamp': String(timestamp),
          'X-API-KEY': accessLicense,
          'X-Customer': customerId,
          'X-Signature': signature,
        },
        signal: AbortSignal.timeout(10000),
      },
    )
    if (!res.ok) return {}
    const json = await res.json() as {
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

async function fetchBlogCount(
  keyword: string,
  clientId: string,
  clientSecret: string,
): Promise<number> {
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(keyword)}&display=1`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return 0
    const json = await res.json() as { total?: number }
    return json.total ?? 0
  } catch {
    return 0
  }
}

export async function POST(req: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 미설정' }, { status: 503 })
  }

  const { keywords } = await req.json() as { keywords?: string[] }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'keywords 배열이 필요합니다.' }, { status: 400 })
  }

  const normalized = keywords.map(k => k.trim().normalize('NFC')).filter(Boolean)
  const cacheKey = [...normalized].sort().join('|')
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  const adCustomerId = process.env.NAVER_AD_CUSTOMER_ID?.trim()
  const adAccessLicense = process.env.NAVER_AD_ACCESS_LICENSE?.trim()
  const adSecretKey = process.env.NAVER_AD_SECRET_KEY?.trim()
  const hasAdApi = !!(adCustomerId && adAccessLicense && adSecretKey)

  const [adVolumes, ...blogCounts] = await Promise.all([
    hasAdApi
      ? fetchBatchAdVolume(normalized, adCustomerId!, adAccessLicense!, adSecretKey!)
      : Promise.resolve({}),
    ...normalized.map(kw => fetchBlogCount(kw, clientId, clientSecret)),
  ])

  const result: RelatedKeywordMap = {}
  normalized.forEach((kw, i) => {
    const ad = (adVolumes as Record<string, { pc: number; mobile: number }>)[kw]
    result[kw] = {
      monthlyPc: ad?.pc ?? null,
      monthlyMobile: ad?.mobile ?? null,
      blogCount: (blogCounts[i] as number) ?? 0,
    }
  })

  CACHE.set(cacheKey, { data: result, ts: Date.now() })
  return NextResponse.json(result)
}
