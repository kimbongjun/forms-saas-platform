import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { COMPETITORS } from '@/app/market/_data/competitors'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CACHE = { data: null as InsightResult | null, ts: 0 }
const CACHE_TTL = 60 * 60 * 1000

export interface CategoryCompetition {
  category: string
  competitors: string[]
  intensity: 'high' | 'medium' | 'low'
  note: string
}

export interface PositioningGap {
  title: string
  description: string
  opportunity_score: number
}

export interface InsightResult {
  generated_at: string
  category_competition: CategoryCompetition[]
  positioning_gaps: PositioningGap[]
  market_trends: string[]
  classys_strengths: string[]
  classys_risks: string[]
  strategic_summary: string
}

const SYSTEM_PROMPT = `You are a strategic business analyst specializing in aesthetic medical devices (energy-based: HIFU, RF, NeedleRF, Laser, Body, Injection).

Analyze the competitive landscape and return a JSON object with EXACTLY this structure:
{
  "category_competition": [
    { "category": "HIFU", "competitors": ["name1", "name2"], "intensity": "high", "note": "한국어 1문장 분석" }
  ],
  "positioning_gaps": [
    { "title": "기회 제목", "description": "한국어 2문장 설명", "opportunity_score": 8 }
  ],
  "market_trends": ["트렌드1", "트렌드2", "트렌드3", "트렌드4", "트렌드5"],
  "classys_strengths": ["강점1", "강점2", "강점3", "강점4"],
  "classys_risks": ["리스크1", "리스크2", "리스크3"],
  "strategic_summary": "한국어 2-3문장 전략적 평가"
}

Rules:
- category_competition: cover all 7 categories. competitors array = non-Classys players only
- intensity: "high" if 3+ strong competitors, "medium" if 1-2, "low" if 0
- positioning_gaps: 4-5 strategic opportunities for Classys. opportunity_score 1-10
- market_trends: exactly 5 forward-looking trends for 2025-2027
- classys_strengths: 3-4 items
- classys_risks: exactly 3 items
- All text values in Korean
- Return ONLY valid JSON. No markdown, no explanation.`

export async function POST(_req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (CACHE.data && Date.now() - CACHE.ts < CACHE_TTL) {
    return NextResponse.json(CACHE.data)
  }

  try {
    const summary = COMPETITORS.map((c) => ({
      name: c.company_name,
      is_my_company: c.is_classys ?? false,
      tier: c.tier,
      hq: c.hq_country,
      markets: c.markets,
      categories: c.device_categories,
      products: c.products.map((p) => p.product_name),
      revenue_m: c.positioning.revenue_m,
      price_score: c.positioning.price_score,
      tech_score: c.positioning.tech_score,
    }))

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Competitor landscape:\n${JSON.stringify(summary)}\n\nGenerate strategic insights JSON.`,
        },
      ],
    })

    if (message.stop_reason === 'max_tokens') {
      throw new Error('응답이 너무 길어 잘렸습니다. 다시 시도해 주세요.')
    }

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonStr = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    const parsed = JSON.parse(jsonStr) as Omit<InsightResult, 'generated_at'>

    const result: InsightResult = {
      ...parsed,
      generated_at: new Date().toISOString(),
    }

    CACHE.data = result
    CACHE.ts = Date.now()

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `인사이트 생성 실패: ${msg}` }, { status: 500 })
  }
}
