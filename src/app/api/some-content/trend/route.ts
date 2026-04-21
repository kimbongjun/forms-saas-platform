import { NextRequest, NextResponse } from 'next/server'

const CACHE = new Map<string, { data: TrendResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1h

export interface TrendPoint { month: string; label: string; value: number }

export interface TrendResult {
  points: TrendPoint[]
  metrics: {
    max: number; maxMonth: string
    min: number; minMonth: string
    avg: number
    recent3Avg: number
    prev3Avg: number
    growthRate: number    // recent3 vs prev3, %
    volatility: number   // peak-to-trough ratio 0-100
    trend: 'up' | 'down' | 'flat'
  }
}

function isoToLabel(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-')
  return `${y.slice(2)}년 ${parseInt(m)}월`
}

function mean(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword')?.trim()
  if (!keyword) return NextResponse.json({ error: 'keyword 필요' }, { status: 400 })

  const cached = CACHE.get(keyword)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return NextResponse.json(cached.data)

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 미설정' }, { status: 503 })
  }

  // 최근 13개월 (전월 포함해서 지수 안정화)
  const end = new Date()
  end.setDate(1)
  end.setDate(0) // last day of previous month
  const start = new Date(end)
  start.setMonth(start.getMonth() - 12)

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  try {
    const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        startDate: fmt(start),
        endDate: fmt(end),
        timeUnit: 'month',
        keywordGroups: [{ groupName: keyword, keywords: [keyword] }],
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `DataLab API 오류 (${res.status})`, detail: text }, { status: 502 })
    }

    const json = await res.json() as {
      results?: { data: { period: string; ratio: number }[] }[]
    }

    const raw = json.results?.[0]?.data ?? []
    const points: TrendPoint[] = raw.map(d => ({
      month: d.period.slice(0, 7),   // YYYY-MM
      label: isoToLabel(d.period.slice(0, 7)),
      value: Math.round(d.ratio),
    }))

    if (!points.length) {
      return NextResponse.json({ error: '데이터 없음 (키워드 검색량 부족)' }, { status: 404 })
    }

    const values = points.map(p => p.value)
    const maxIdx = values.indexOf(Math.max(...values))
    const minIdx = values.indexOf(Math.min(...values))
    const n = values.length
    const recent3 = values.slice(-3)
    const prev3 = values.slice(-6, -3)
    const recent3Avg = mean(recent3)
    const prev3Avg = mean(prev3)
    const growthRate = prev3Avg > 0 ? Math.round(((recent3Avg - prev3Avg) / prev3Avg) * 100) : 0
    const peak = Math.max(...values)
    const trough = Math.min(...values)
    const volatility = peak > 0 ? Math.round(((peak - trough) / peak) * 100) : 0

    // Simple trend: last half avg vs first half avg
    const half = Math.floor(n / 2)
    const firstHalf = mean(values.slice(0, half))
    const secondHalf = mean(values.slice(half))
    const trend: TrendResult['metrics']['trend'] =
      secondHalf > firstHalf * 1.05 ? 'up' :
      secondHalf < firstHalf * 0.95 ? 'down' : 'flat'

    const result: TrendResult = {
      points,
      metrics: {
        max: values[maxIdx],
        maxMonth: points[maxIdx].label,
        min: values[minIdx],
        minMonth: points[minIdx].label,
        avg: Math.round(mean(values)),
        recent3Avg: Math.round(recent3Avg),
        prev3Avg: Math.round(prev3Avg),
        growthRate,
        volatility,
        trend,
      },
    }

    CACHE.set(keyword, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
