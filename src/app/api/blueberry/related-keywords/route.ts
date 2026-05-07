import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

// 1시간 캐시 (키: sorted keywords join)
const CACHE = new Map<string, { data: RelatedKeywordMap; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000

export type RelatedKeywordData = {
  monthlyPc: number | null
  monthlyMobile: number | null
  blogCount: number
  /** DataLab 기반 최근 30일 트렌드: 직전 달 대비 비율 (>1.3 = 급상승, <0.7 = 하락) */
  trendRatio: number
  /** 검색량·콘텐츠포화도·트렌드를 종합한 연관성 점수 (워드클라우드 크기 기준) */
  relevanceScore: number
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

// DataLab 검색 트렌드 API: 직전 달 대비 현재 달 비율 계산
// 반환값: keyword → trendRatio (1.0 = 변화 없음, >1.3 = 급상승)
async function fetchDatalabTrends(
  keywords: string[],
  clientId: string,
  clientSecret: string,
): Promise<Record<string, number>> {
  if (keywords.length === 0) return {}

  const now = new Date()
  // 최근 3개월 데이터 조회 (월별 단위)
  const endMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 3, 1)

  function fmtDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }
  function fmtEndDate(d: Date) {
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${last.getDate()}`
  }

  const startDate = fmtDate(startMonth)
  const endDate = fmtEndDate(endMonth)

  const result: Record<string, number> = {}
  const BATCH = 5  // DataLab API: 요청당 최대 5개 그룹

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)

  try {
    for (let i = 0; i < keywords.length; i += BATCH) {
      const batch = keywords.slice(i, i + BATCH)
      const body = {
        startDate,
        endDate,
        timeUnit: 'month',
        keywordGroups: batch.map(kw => ({ groupName: kw, keywords: [kw] })),
      }

      const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
        method: 'POST',
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) continue

      const json = await res.json() as {
        results?: { title: string; data: { period: string; ratio: number }[] }[]
      }

      for (const item of json.results ?? []) {
        const data = item.data
        if (data.length < 2) { result[item.title] = 1.0; continue }
        const prev = data[data.length - 2].ratio
        const curr = data[data.length - 1].ratio
        // 직전 달 대비 현재 달 비율 (prev=0이면 중립)
        result[item.title] = prev > 0 ? Math.round((curr / prev) * 100) / 100 : 1.0
      }
    }
  } catch {
    // 타임아웃 또는 네트워크 오류 시 폴백 — 트렌드 없이 진행
  } finally {
    clearTimeout(timer)
  }

  return result
}

// 연관성 점수 계산
// - 검색량(로그 스케일): 기본 크기
// - 콘텐츠 포화도 페널티: 블로그 수가 검색량 대비 많을수록 감점
// - 트렌드 보너스: 최근 급상승 키워드 우선
function computeRelevanceScore(vol: number, blogCount: number, trendRatio: number): number {
  if (vol <= 0) return 1

  // 로그 스케일 검색량 점수 (0~30 범위)
  const volScore = Math.log10(Math.max(vol, 10)) * 10

  // 포화도: 블로그 누적 수 / (검색량 × 계수) — 낮을수록 경쟁 적음 = 클릭률 높음
  const saturation = Math.min(blogCount / Math.max(vol * 0.3, 1), 1.0)

  // 트렌드 가중치: >1.3 = 급상승(+50%), 1.1~1.3 = 상승(+20%), 0.7~0.9 = 하락(-20%)
  const trendMultiplier = trendRatio >= 1.3 ? 1.5 : trendRatio >= 1.1 ? 1.2 : trendRatio <= 0.7 ? 0.8 : 1.0

  return Math.round(volScore * (1 - saturation * 0.4) * trendMultiplier * 10) / 10
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

  // 트렌드 분석은 상위 10개 키워드에만 적용 (비용 절감)
  const TOP_FOR_TREND = 10

  const [adVolumes, trends, ...blogCounts] = await Promise.all([
    hasAdApi
      ? fetchBatchAdVolume(normalized, adCustomerId!, adAccessLicense!, adSecretKey!)
      : Promise.resolve({}),
    fetchDatalabTrends(normalized.slice(0, TOP_FOR_TREND), clientId, clientSecret),
    ...normalized.map(kw => fetchBlogCount(kw, clientId, clientSecret)),
  ])

  const result: RelatedKeywordMap = {}
  normalized.forEach((kw, i) => {
    const ad = (adVolumes as Record<string, { pc: number; mobile: number }>)[kw]
    const blogCount = (blogCounts[i] as number) ?? 0
    const vol = (ad?.pc ?? 0) + (ad?.mobile ?? 0)
    const trendRatio = (trends as Record<string, number>)[kw] ?? 1.0
    const relevanceScore = computeRelevanceScore(vol, blogCount, trendRatio)

    result[kw] = {
      monthlyPc: ad?.pc ?? null,
      monthlyMobile: ad?.mobile ?? null,
      blogCount,
      trendRatio,
      relevanceScore,
    }
  })

  CACHE.set(cacheKey, { data: result, ts: Date.now() })
  return NextResponse.json(result)
}
