import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 요청 간 캐시 (1시간)
const ENRICH_CACHE = new Map<string, { data: EnrichResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000

export interface EnrichResult {
  competitor_id: string
  company_name: string
  verified_device_categories: string[]
  verified_products: VerifiedProduct[]
  confidence_score: number // 0~100
  data_sources: string[]
  verified_at: string
  notes: string
}

interface VerifiedProduct {
  product_name: string
  category: string
  energy_type: string
  key_certifications: string[]
  source_url?: string
}

interface SerperResult {
  organic?: Array<{
    title: string
    snippet: string
    link: string
  }>
  knowledgeGraph?: {
    description?: string
    attributes?: Record<string, string>
  }
}

async function searchSerper(query: string): Promise<SerperResult> {
  const key = process.env.SERPER_API_KEY
  if (!key) throw new Error('SERPER_API_KEY 미설정')

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5, gl: 'us', hl: 'en' }),
  })
  if (!res.ok) throw new Error(`Serper error: ${res.status}`)
  return res.json() as Promise<SerperResult>
}

function buildSearchContext(results: SerperResult, results2: SerperResult): string {
  const snippets: string[] = []

  if (results.knowledgeGraph?.description) {
    snippets.push(`[Knowledge Graph] ${results.knowledgeGraph.description}`)
  }
  for (const r of results.organic?.slice(0, 4) ?? []) {
    snippets.push(`[${r.title}] ${r.snippet} (${r.link})`)
  }
  for (const r of results2.organic?.slice(0, 3) ?? []) {
    snippets.push(`[${r.title}] ${r.snippet} (${r.link})`)
  }
  return snippets.join('\n\n')
}

const SYSTEM_PROMPT = `You are a medical aesthetics device expert with deep knowledge of HIFU, RF, Microneedle RF (MNRF), Laser, Body contouring, and Injectable technologies.

Your task: verify and classify aesthetic device company products into correct categories.

CRITICAL DISTINCTIONS:
- HIFU: Micro-focused high-intensity focused ultrasound for face/neck lifting (e.g., Ultherapy, Ultraformer). NOT body ultrasound fat reduction.
- RF: Radiofrequency devices without microneedles (e.g., Thermage = Monopolar RF, BodyTite = Bipolar RF). Thermage is RF, NOT HIFU.
- NeedleRF (MNRF): Fractional RF delivered via microneedles/insulated needles (e.g., Morpheus8, GENIUS, Secret RF, SYLFIRM X, Volnewmer). Also called: Fractional RF Microneedling, RF Microneedling, Micro-needle RF.
- Laser: Light-based treatments (Nd:YAG, Alexandrite, Diode, Er:YAG, CO2, Pico, Q-switched, Thulium, Fractional laser)
- Body: Non-face body contouring devices (fat reduction, cellulite, muscle toning)
- Injection: Neuromodulators (botulinum toxin), dermal fillers, bio-stimulators
- Combo: Multi-technology platforms combining 3+ energy types

Return ONLY valid JSON, no markdown.`

function buildAnalysisPrompt(company: string, context: string): string {
  return `Company: "${company}"

Search results:
${context}

Analyze these search results and return a JSON object with this exact structure:
{
  "verified_device_categories": ["HIFU"|"RF"|"NeedleRF"|"Laser"|"Body"|"Injection"|"Combo"],
  "verified_products": [
    {
      "product_name": "string",
      "category": "HIFU"|"RF"|"NeedleRF"|"Laser"|"Body"|"Injection"|"Combo",
      "energy_type": "precise technical description",
      "key_certifications": ["FDA"|"CE"|"KFDA"],
      "source_url": "url if found"
    }
  ],
  "confidence_score": 0-100,
  "notes": "brief explanation of key corrections or confirmations"
}

Rules:
- confidence_score: 90+ if official website/press release found; 70-89 if reputable medical journal/news; 50-69 if industry estimates
- Include only products clearly mentioned in search results
- Be precise about energy types — distinguish Monopolar RF vs Bipolar RF vs Fractional RF Microneedling
- verified_device_categories must match products listed`
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { competitor_id: string; company_name: string }
  const { competitor_id, company_name } = body
  if (!competitor_id || !company_name) {
    return NextResponse.json({ error: 'competitor_id, company_name 필요' }, { status: 400 })
  }

  const cached = ENRICH_CACHE.get(competitor_id)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    // Step 1: Serper로 두 가지 쿼리 병렬 검색
    const [r1, r2] = await Promise.all([
      searchSerper(`"${company_name}" aesthetic medical device product line HIFU RF microneedling specifications`),
      searchSerper(`"${company_name}" energy based device FDA cleared CE marked product portfolio 2023 2024`),
    ])

    const context = buildSearchContext(r1, r2)

    // Step 2: Claude로 데이터 검증·분류
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildAnalysisPrompt(company_name, context) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonStr) as {
      verified_device_categories: string[]
      verified_products: VerifiedProduct[]
      confidence_score: number
      notes: string
    }

    const sources = [
      ...(r1.organic?.slice(0, 2).map(r => r.link) ?? []),
      ...(r2.organic?.slice(0, 2).map(r => r.link) ?? []),
    ]

    const result: EnrichResult = {
      competitor_id,
      company_name,
      verified_device_categories: parsed.verified_device_categories,
      verified_products: parsed.verified_products,
      confidence_score: parsed.confidence_score,
      data_sources: sources,
      verified_at: new Date().toISOString(),
      notes: parsed.notes,
    }

    ENRICH_CACHE.set(competitor_id, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `검증 실패: ${msg}` }, { status: 500 })
  }
}
