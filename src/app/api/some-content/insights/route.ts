// src/app/api/some-content/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import { claude, MODEL_INSIGHT } from '@/lib/claude'
import { SOME_CONTENT_SYSTEM_PROMPT, buildInsightPrompt } from '@/lib/prompts/some-content'

export interface InsightsResult {
  trend_summary: string
  opportunities: string[]
  risks: string[]
  recommendations: string[]
  generated_by?: 'claude' | 'groq_fallback'
  generated_at?: string
}

const CACHE = new Map<string, { data: InsightsResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000   // 1시간 인메모리 캐시 (sc_claude_insights와 별개)

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

  const { keyword, metrics, positive, negative, mentionsByChannel, keyword_id } = body
  if (!keyword) return NextResponse.json({ error: 'keyword 필요' }, { status: 400 })

  const cacheKey = `${keyword}:${metrics?.trend}:${metrics?.growthRate}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return NextResponse.json(cached.data)

  // sc_claude_insights 캐시 우선 조회
  if (keyword_id) {
    const { data: cachedInsight } = await supabase
      .from('sc_claude_insights')
      .select('payload, expires_at')
      .eq('keyword_id', keyword_id)
      .eq('insight_type', 'comprehensive')
      .gt('expires_at', new Date().toISOString())
      .single()
    if (cachedInsight?.payload) {
      const result = { ...(cachedInsight.payload as InsightsResult), generated_by: 'claude' as const }
      CACHE.set(cacheKey, { data: result, ts: Date.now() })
      return NextResponse.json(result)
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY 미설정' }, { status: 503 })
  }

  const topKeywords = [
    ...(positive ?? []).slice(0, 8).map(w => w.word),
    ...(negative ?? []).slice(0, 5).map(w => w.word),
  ]

  try {
    const message = await claude.messages.create({
      model: MODEL_INSIGHT,
      max_tokens: 1000,
      system: SOME_CONTENT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildInsightPrompt({
          keyword,
          mentionsByChannel: mentionsByChannel ?? {},
          sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
          topKeywords,
          metrics,
        }),
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const parsed = JSON.parse(text) as InsightsResult

    const result: InsightsResult = {
      trend_summary: parsed.trend_summary ?? '',
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      generated_by: 'claude',
      generated_at: new Date().toISOString(),
    }

    CACHE.set(cacheKey, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch {
    // Claude 실패 시 Groq 폴백
    try {
      const groqKey = process.env.GROQ_API_KEY
      if (!groqKey) throw new Error('no groq key')
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.35,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SOME_CONTENT_SYSTEM_PROMPT },
            { role: 'user', content: buildInsightPrompt({ keyword, mentionsByChannel: mentionsByChannel ?? {}, sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }, topKeywords }) },
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
        generated_by: 'groq_fallback',
        generated_at: new Date().toISOString(),
      }
      CACHE.set(cacheKey, { data: result, ts: Date.now() })
      return NextResponse.json(result)
    } catch {
      return NextResponse.json({ error: 'AI 분석 서비스 일시 불가' }, { status: 503 })
    }
  }
}
