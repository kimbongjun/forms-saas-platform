import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PRESS_CACHE = new Map<string, { data: PressResult; ts: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1시간

export type PressItemType = 'launch' | 'ma' | 'clinical' | 'financial' | 'partnership' | 'award' | 'other'

export interface PressItem {
  title: string
  summary: string
  date: string   // "YYYY-MM" or "YYYY-MM-DD"
  source: string // domain only e.g. "businesswire.com"
  url: string
  type: PressItemType
}

export interface PressResult {
  competitor_id: string
  company_name: string
  items: PressItem[]
  fetched_at: string
}

interface SerperOrganic {
  title: string
  snippet: string
  link: string
  date?: string
}

async function searchSerper(query: string): Promise<SerperOrganic[]> {
  const key = process.env.SERPER_API_KEY
  if (!key) throw new Error('SERPER_API_KEY 미설정')
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 8, gl: 'us', hl: 'en', tbs: 'qdr:y' }),
  })
  if (!res.ok) throw new Error(`Serper error: ${res.status}`)
  const data = await res.json() as { organic?: SerperOrganic[] }
  return data.organic ?? []
}

const SYSTEM_PROMPT = `You are a business analyst extracting news and press releases about aesthetic medical device companies.

From the search results, extract up to 6 notable news items. For each:
- title: concise headline (from search result title)
- summary: 1-2 sentences explaining the news in plain language
- date: date as "YYYY-MM" or "YYYY-MM-DD" if visible, else "2025"
- source: domain name only (e.g. "businesswire.com", "reuters.com")
- url: exact URL from search result
- type: one of: launch | ma | clinical | financial | partnership | award | other
  - launch = new product, FDA clearance, product update
  - ma = acquisition, merger, investment round
  - clinical = study results, trial, publication
  - financial = earnings, revenue, IPO
  - partnership = distribution deal, co-development
  - award = industry award, recognition
  - other = anything else

Return ONLY a valid JSON array of objects. No markdown, no explanation.`

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { competitor_id: string; company_name: string }
  const { competitor_id, company_name } = body
  if (!competitor_id || !company_name) {
    return NextResponse.json({ error: 'competitor_id, company_name 필요' }, { status: 400 })
  }

  const cached = PRESS_CACHE.get(competitor_id)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const [r1, r2] = await Promise.all([
      searchSerper(`"${company_name}" aesthetic medical device news press release 2025 2026`),
      searchSerper(`"${company_name}" laser RF HIFU product launch FDA cleared CE marked 2025 2026`),
    ])

    const seen = new Set<string>()
    const snippets: string[] = []
    for (const r of [...r1, ...r2]) {
      if (seen.has(r.link)) continue
      seen.add(r.link)
      snippets.push(`[${r.title}] ${r.snippet} | URL: ${r.link}${r.date ? ` | Date: ${r.date}` : ''}`)
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Company: "${company_name}"\n\nSearch results:\n${snippets.slice(0, 10).join('\n\n')}\n\nExtract press items as JSON array.`,
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
    // Extract JSON array robustly — handles markdown fences and leading text
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('[press] Claude non-JSON response:', raw.slice(0, 200))
      throw new Error('Claude가 유효한 JSON 배열을 반환하지 않았습니다')
    }
    const items = JSON.parse(jsonMatch[0]) as PressItem[]

    const result: PressResult = {
      competitor_id,
      company_name,
      items: items.slice(0, 6),
      fetched_at: new Date().toISOString(),
    }

    PRESS_CACHE.set(competitor_id, { data: result, ts: Date.now() })
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `보도자료 조회 실패: ${msg}` }, { status: 500 })
  }
}
