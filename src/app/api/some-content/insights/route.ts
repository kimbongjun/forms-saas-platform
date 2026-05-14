import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { SOME_CONTENT_SYSTEM_PROMPT, buildInsightPrompt } from '@/lib/prompts/some-content'

export interface InsightsResult {
  trend_summary: string
  opportunities: string[]
  risks: string[]
  recommendations: string[]
  generated_by?: 'groq'
  generated_at?: string
}

const CACHE = new Map<string, { data: InsightsResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    keyword: string
    keyword_id?: string
    metrics?: { trend: string; growthRate: number; volatility: number; avg: number; recent3Avg: number; maxMonth: string; minMonth: string }
    sentimentSummary?: string
    positive?: { word: string; weight: number }[]
    negative?: { word: string; weight: number }[]
    mentionsByChannel?: Record<string, number>
  }

  const { keyword, metrics, positive, negative, mentionsByChannel } = body
  if (!keyword) return NextResponse.json({ error: 'keyword 필요' }, { status: 400 })

  const cacheKey = `${keyword}:${metrics?.trend}:${metrics?.growthRate}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return NextResponse.json(cached.data)

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: 'GROQ_API_KEY 미설정' }, { status: 503 })

  const topKeywords = [
    ...(positive ?? []).slice(0, 8).map(w => w.word),
    ...(negative ?? []).slice(0, 5).map(w => w.word),
  ]

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SOME_CONTENT_SYSTEM_PROMPT },
          { role: 'user', content: buildInsightPrompt({ keyword, mentionsByChannel: mentionsByChannel ?? {}, sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }, topKeywords, metrics }) },
        ],
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error('groq failed')
    const json = (await res.json()) as { choices: { message: { content: string } }[] }
    const parsed = JSON.parse(json.choices[0]?.message?.content ?? '{}') as InsightsResult
    const result: InsightsResult = {
      trend_summary: parsed.trend_summary ?? '',
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      generated_by: 'groq',
      generated_at: new Date().toISOString(),
    }
    CACHE.set(cacheKey, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'AI 분석 서비스 일시 불가' }, { status: 503 })
  }
}
