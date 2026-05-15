import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface BrandVisibility {
  brand: string
  mentioned: boolean
  rank: number | null      // 1-5, null = 언급 없음
  prominence: 'primary' | 'secondary' | 'not_mentioned'
}

export interface PlaygroundResult {
  query: string
  perspective: string
  model_a: { name: string; answer: string }
  model_b: { name: string; answer: string }
  brand_visibility: BrandVisibility[]
  geo_insights: string[]
  generated_at: string
}

const SYSTEM_PROMPT = `당신은 한국 에스테틱 의료기기 GEO/AEO 분석 전문가입니다.
사용자의 질문에 대해 두 가지 AI 스타일의 답변을 시뮬레이션하고, 6개 브랜드(볼뉴머, 써마지, 덴서티, 올리지오, 텐써마, XERF)의 AI 노출 가시성을 분석합니다.
볼뉴머는 Classys의 자체 브랜드(모노폴라 RF 기기)로, 써마지와 직접 경쟁합니다.

반드시 다음 JSON 형식만 반환하세요. 마크다운, 코드블럭, 설명 없이 순수 JSON만:
{
  "model_a": {
    "name": "일반 AI 어시스턴트 (ChatGPT 스타일)",
    "answer": "객관적이고 균형 잡힌 한국어 답변 (150~200자)"
  },
  "model_b": {
    "name": "검색 통합 AI (Gemini/Perplexity 스타일)",
    "answer": "최신 검색 결과 기반 한국어 답변, 한국 시장 중심 (150~200자)"
  },
  "brand_visibility": [
    { "brand": "볼뉴머",  "mentioned": true/false, "rank": null 또는 1~6, "prominence": "primary/secondary/not_mentioned" },
    { "brand": "써마지",  "mentioned": true/false, "rank": null 또는 1~6, "prominence": "primary/secondary/not_mentioned" },
    { "brand": "덴서티",  "mentioned": true/false, "rank": null 또는 1~6, "prominence": "secondary/not_mentioned" },
    { "brand": "올리지오","mentioned": true/false, "rank": null 또는 1~6, "prominence": "secondary/not_mentioned" },
    { "brand": "텐써마",  "mentioned": false,       "rank": null,          "prominence": "not_mentioned" },
    { "brand": "XERF",   "mentioned": false,       "rank": null,          "prominence": "not_mentioned" }
  ],
  "geo_insights": [
    "GEO 인사이트 1: 볼뉴머 vs 써마지 AI 노출 비교",
    "GEO 인사이트 2: 볼뉴머 콘텐츠 최적화 전략",
    "GEO 인사이트 3: AI 답변 내 볼뉴머 노출 개선 방향"
  ]
}

brand_visibility의 prominence 규칙:
- primary: 답변에서 첫 번째 또는 가장 강조되어 언급
- secondary: 언급되나 주요 추천이 아님
- not_mentioned: 언급 없음

볼뉴머(Volnewmer)는 현재 AI 답변에서 써마지보다 낮은 순위로 노출되는 경향이 있으므로, 실제 AI 답변 패턴을 반영하여 현실적으로 시뮬레이션하세요.`

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { query?: string; perspective?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '요청 형식 오류' }, { status: 400 })
  }

  const { query, perspective = 'general' } = body
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query 필수' }, { status: 400 })
  }

  const perspectiveMap: Record<string, string> = {
    general: '뷰티/시술에 비전문가인 30~40대 일반 소비자',
    young: '처음으로 리프팅 시술을 고려하는 20대 직장인',
    medical: '장비 도입을 검토 중인 피부과 원장',
  }
  const perspectiveDesc = perspectiveMap[perspective] ?? perspectiveMap.general

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `질문: "${query}"\n질문자 페르소나: ${perspectiveDesc}\n\n위 질문에 대한 두 AI 모델의 시뮬레이션 답변과 GEO 분석을 JSON으로 반환해주세요.`,
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude가 유효한 JSON을 반환하지 않았습니다')

    const parsed = JSON.parse(jsonMatch[0]) as Omit<PlaygroundResult, 'query' | 'perspective' | 'generated_at'>

    const result: PlaygroundResult = {
      query: query.trim(),
      perspective,
      ...parsed,
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[geo/playground] error:', msg)
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 })
  }
}
