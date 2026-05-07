import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

// ── 서버사이드 1시간 캐시 ────────────────────────────────────────
const CACHE = new Map<string, { data: NaverKeywordResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000

export interface NaverRelatedKeyword {
  keyword: string
  monthlyPc: number
  monthlyMobile: number
  /** 연관도 점수 (0~100, 높을수록 주 키워드와 연관성 높음) */
  relevanceScore: number
}

export interface NaverKeywordResult {
  monthlyPcQcCnt: number | null
  monthlyMobileQcCnt: number | null
  contentByPlatform: {
    blog: number
    cafe: number
    news: number
    kin: number
    shop: number
  }
  /** 연관도 기반 정렬된 연관 키워드 (최대 20개) */
  relatedKeywords: NaverRelatedKeyword[]
  fetchedAt: string
}

function parseQcCnt(v: number | string | undefined | null): number {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Math.round(v)
  const s = String(v).trim()
  if (s.startsWith('<')) return 0
  const n = parseInt(s.replace(/,/g, ''), 10)
  return isNaN(n) ? 0 : n
}

// ── Naver 검색광고 API — 실측 월간 검색량 + keywordList 연관 키워드 ──
async function fetchAdSearchVolume(
  keyword: string,
  customerId: string,
  accessLicense: string,
  secretKey: string,
): Promise<{ pc: number; mobile: number; rawList: { keyword: string; pc: number; mobile: number }[] } | null> {
  const timestamp = Date.now()
  const method = 'GET'
  const path = '/keywordstool'
  const message = `${timestamp}.${method}.${path}`
  const signature = createHmac('sha256', secretKey).update(message).digest('base64')

  try {
    const res = await fetch(
      `https://api.naver.com${path}?hintKeywords=${encodeURIComponent(keyword)}&showDetail=1`,
      {
        headers: {
          'X-Timestamp': String(timestamp),
          'X-API-KEY': accessLicense,
          'X-Customer': customerId,
          'X-Signature': signature,
        },
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!res.ok) return null
    const json = await res.json() as {
      keywordList?: {
        relKeyword: string
        monthlyPcQcCnt: number | string
        monthlyMobileQcCnt: number | string
      }[]
    }

    const trimmed = keyword.trim().normalize('NFC')
    const list = json.keywordList ?? []
    const row = list.find((k) => k.relKeyword.trim().normalize('NFC') === trimmed)
    if (!row) return null

    const pc = parseQcCnt(row.monthlyPcQcCnt)
    const mobile = parseQcCnt(row.monthlyMobileQcCnt)

    const rawList = list
      .filter((k) => k.relKeyword.trim().normalize('NFC') !== trimmed)
      .map((k) => ({
        keyword: k.relKeyword,
        pc: parseQcCnt(k.monthlyPcQcCnt),
        mobile: parseQcCnt(k.monthlyMobileQcCnt),
      }))

    return { pc, mobile, rawList }
  } catch (e) {
    console.error('[Blueberry/Naver] AdAPI exception:', e)
    return null
  }
}

// ── Naver Autocomplete (연관 검색어) — 공개 AC API ────────────────
// 네이버 자동완성 API: 사용자가 실제로 연이어 검색하는 "연관 검색어" 반환
async function fetchNaverAutocomplete(keyword: string): Promise<string[]> {
  try {
    const url = `https://ac.search.naver.com/nx/ac?q=${encodeURIComponent(keyword)}&q_enc=utf-8&st=1&frm=nv&r_format=json&r_enc=utf-8&r_unicode=0&t_koreng=1&ans=2&run=2&rev=4&con=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DataBot/1.0)' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const text = await res.text()
    // Response: {"answer":[["keyword1",0],["keyword2",0],...]}
    const json = JSON.parse(text) as { answer?: [string, number][] }
    return (json.answer ?? []).map((item) => item[0]).filter(Boolean)
  } catch {
    return []
  }
}

// ── 연관도 스코어링 ───────────────────────────────────────────────
// 기준: 텍스트 연관성(주 키워드 포함/확장 여부) + 검색량 균형 + 출처 보너스
function scoreRelevance(
  candidate: string,
  mainKeyword: string,
  candidateVol: number,
  mainVol: number,
  isFromAutocomplete: boolean,
): number {
  const main = mainKeyword.trim()
  const cand = candidate.trim()

  // 1. 텍스트 연관도 (0~50점)
  let textScore = 0
  if (cand === main) return -1  // 주 키워드 자신은 제외
  if (cand.startsWith(main) || cand.endsWith(main)) textScore = 50          // 확장 키워드 (ex. "슈링크 가격")
  else if (cand.includes(main)) textScore = 40                              // 포함 키워드
  else if (main.includes(cand)) textScore = 35                              // 역포함
  else {
    // 공유 음절 비율
    const mainChars = new Set([...main])
    const shared = [...cand].filter(c => mainChars.has(c)).length
    textScore = Math.min(25, Math.round((shared / Math.max(main.length, 1)) * 30))
  }

  // 2. 검색량 균형 점수 (0~30점) — 주 키워드와 비슷한 볼륨일수록 더 연관
  let volScore = 0
  if (mainVol > 0 && candidateVol > 0) {
    const ratio = Math.min(candidateVol, mainVol) / Math.max(candidateVol, mainVol)
    volScore = Math.round(ratio * 30)
  }

  // 3. 자동완성 출처 보너스 (0~20점) — 자동완성은 직접 연관 검색어
  const autocompleteBonus = isFromAutocomplete ? 20 : 0

  return textScore + volScore + autocompleteBonus
}

// ── Naver 검색 API (채널별 총 결과 수) ───────────────────────────
async function fetchSearchTotal(
  keyword: string,
  type: 'blog' | 'cafearticle' | 'news' | 'kin' | 'shop',
  clientId: string,
  clientSecret: string,
): Promise<number> {
  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(keyword)}&display=1`,
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
    return NextResponse.json(
      { error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 설정되지 않았습니다.' },
      { status: 503 },
    )
  }

  const { keyword } = await req.json() as { keyword?: string }
  if (!keyword?.trim()) {
    return NextResponse.json({ error: 'keyword 파라미터가 필요합니다.' }, { status: 400 })
  }

  const cacheKey = keyword.trim().normalize('NFC')
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, fromCache: true })
  }

  const adCustomerId = process.env.NAVER_AD_CUSTOMER_ID?.trim()
  const adAccessLicense = process.env.NAVER_AD_ACCESS_LICENSE?.trim()
  const adSecretKey = process.env.NAVER_AD_SECRET_KEY?.trim()
  const hasAdApi = !!(adCustomerId && adAccessLicense && adSecretKey)

  try {
    const [adVolume, autocompleteKeywords, blog, cafe, news, kin, shop] = await Promise.all([
      hasAdApi
        ? fetchAdSearchVolume(cacheKey, adCustomerId!, adAccessLicense!, adSecretKey!)
        : Promise.resolve(null),
      fetchNaverAutocomplete(cacheKey),
      fetchSearchTotal(keyword, 'blog', clientId, clientSecret),
      fetchSearchTotal(keyword, 'cafearticle', clientId, clientSecret),
      fetchSearchTotal(keyword, 'news', clientId, clientSecret),
      fetchSearchTotal(keyword, 'kin', clientId, clientSecret),
      fetchSearchTotal(keyword, 'shop', clientId, clientSecret),
    ])

    const mainVol = adVolume ? adVolume.pc + adVolume.mobile : 0

    // ── 연관 키워드 병합 및 연관도 스코어링 ─────────────────────
    const candidateMap = new Map<string, { pc: number; mobile: number; isAutocomplete: boolean }>()

    // 1순위: 검색광고 API keywordList (함께 많이 찾는 키워드)
    for (const item of adVolume?.rawList ?? []) {
      const key = item.keyword.trim().normalize('NFC')
      if (!candidateMap.has(key)) {
        candidateMap.set(key, { pc: item.pc, mobile: item.mobile, isAutocomplete: false })
      }
    }

    // 2순위: 자동완성 API 연관 검색어 (Ad API에 없는 것만 추가)
    for (const kw of autocompleteKeywords) {
      const key = kw.trim().normalize('NFC')
      if (!candidateMap.has(key) && key !== cacheKey) {
        candidateMap.set(key, { pc: 0, mobile: 0, isAutocomplete: true })
      } else if (candidateMap.has(key)) {
        // 이미 있으면 autocomplete 플래그만 업데이트
        const existing = candidateMap.get(key)!
        candidateMap.set(key, { ...existing, isAutocomplete: true })
      }
    }

    const relatedKeywords: NaverRelatedKeyword[] = []

    for (const [key, data] of candidateMap.entries()) {
      const vol = data.pc + data.mobile
      const score = scoreRelevance(key, cacheKey, vol, mainVol, data.isAutocomplete)
      if (score < 0) continue  // 주 키워드 자신 제외
      relatedKeywords.push({
        keyword: key,
        monthlyPc: data.pc,
        monthlyMobile: data.mobile,
        relevanceScore: score,
      })
    }

    // 연관도 내림차순 정렬, 상위 20개
    relatedKeywords.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const top20 = relatedKeywords.slice(0, 20)

    const result: NaverKeywordResult = {
      monthlyPcQcCnt: adVolume?.pc ?? null,
      monthlyMobileQcCnt: adVolume?.mobile ?? null,
      contentByPlatform: { blog, cafe, news, kin, shop },
      relatedKeywords: top20,
      fetchedAt: new Date().toISOString(),
    }

    CACHE.set(cacheKey, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch (e) {
    console.error('[Blueberry/Naver] API Error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
