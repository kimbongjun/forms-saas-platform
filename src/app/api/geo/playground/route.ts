import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function sanitizeGeoJson(raw: string): string {
  // 마크다운 코드 펜스 제거
  let s = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
  // 가장 바깥 JSON 객체 추출
  const m = s.match(/\{[\s\S]*\}/)
  if (!m) return '{}'
  s = m[0]
  // 후행 콤마 제거 (, 다음에 } 또는 ] 가 오는 경우)
  s = s.replace(/,(\s*[}\]])/g, '$1')
  return s
}

export interface BrandVisibility {
  brand:      string
  mentioned:  boolean
  rank:       number | null
  prominence: 'primary' | 'secondary' | 'not_mentioned'
}

export interface PlaygroundResult {
  query:          string
  perspective:    string
  model_chatgpt:  { name: string; answer: string }
  model_gemini:   { name: string; answer: string }
  model_claude:   { name: string; answer: string }
  brand_visibility: BrandVisibility[]
  geo_insights:   string[]
  generated_at:   string
}

const QUERY_SYSTEM = `당신은 한국 에스테틱·의료기기 분야 전문 AI 어시스턴트입니다.
사용자가 리프팅 시술, 미용 기기, 피부 관리에 대해 질문할 때 신뢰도 높은 정보를 한국어로 제공하세요.

답변 원칙:
- 시술 원리, 효과, 지속 기간, 권장 횟수, 비용대비 효과, 주의사항을 구체적으로 설명합니다.
- 관련 브랜드·제품명(예: 써마지, 볼뉴머, 울쎄라, 슈링크, 덴서티, 올리지오 등)을 자연스럽게 언급하고 특징을 비교합니다.
- 질문자의 상황(일반 소비자, 20대 직장인, 의료진 등)에 맞는 실질적인 정보와 조언을 제공합니다.
- 전문 용어는 쉽게 풀어 설명하고, 필요 시 소제목이나 항목 나열로 구조화하여 가독성을 높입니다.
- 단순 요약이 아니라 실제 AI 어시스턴트가 응답하듯 충분한 깊이와 맥락을 담아 작성합니다.`

const ANALYSIS_SYSTEM = `당신은 GEO(Generative Engine Optimization) 분석 전문가입니다.
3개 AI 모델(ChatGPT, Gemini, Claude)의 실제 답변을 분석하여 6개 브랜드의 AI 노출 가시성을 평가합니다.
볼뉴머는 Classys의 모노폴라 RF 기기로 써마지와 직접 경쟁하며, 현재 AI 답변에서 써마지보다 낮은 순위로 노출되는 경향이 있습니다.

각 필드 규칙:
- mentioned: 답변에 언급되면 true, 미언급이면 false (boolean)
- rank: 언급 시 1~6 사이 정수(가장 주요하게 언급된 브랜드=1), 미언급이면 null
- prominence: 주요 언급이면 "primary", 부수적 언급이면 "secondary", 미언급이면 "not_mentioned"

반드시 다음 JSON 형식만 반환하세요 (마크다운·코드블럭 없이 순수 JSON):
{
  "brand_visibility": [
    { "brand": "볼뉴머",  "mentioned": true,  "rank": 2,    "prominence": "secondary" },
    { "brand": "써마지",  "mentioned": true,  "rank": 1,    "prominence": "primary" },
    { "brand": "덴서티",  "mentioned": false, "rank": null, "prominence": "not_mentioned" },
    { "brand": "올리지오","mentioned": false, "rank": null, "prominence": "not_mentioned" },
    { "brand": "텐써마",  "mentioned": false, "rank": null, "prominence": "not_mentioned" },
    { "brand": "XERF",   "mentioned": false, "rank": null, "prominence": "not_mentioned" }
  ],
  "geo_insights": [
    "인사이트 1: 3개 AI 모델에서 볼뉴머 노출 패턴 비교 및 현황",
    "인사이트 2: 볼뉴머 GEO 콘텐츠 최적화 전략 제안",
    "인사이트 3: AI 답변 내 볼뉴머 노출 개선을 위한 구체적 방향"
  ]
}`

const perspectiveMap: Record<string, string> = {
  general: '뷰티/시술에 비전문가인 30~40대 일반 소비자',
  young:   '처음으로 리프팅 시술을 고려하는 20대 직장인',
  medical: '장비 도입을 검토 중인 피부과 원장',
}

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
  if (!query?.trim()) return NextResponse.json({ error: 'query 필수' }, { status: 400 })

  const perspectiveDesc = perspectiveMap[perspective] ?? perspectiveMap.general
  const userMessage = `[질문자: ${perspectiveDesc}]\n\n${query.trim()}`

  // ── 3개 AI 모델 병렬 호출 ──────────────────────────────────────────────────
  const [gptRes, geminiRes, claudeRes] = await Promise.allSettled([
    // ChatGPT (GPT-4o-mini)
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: QUERY_SYSTEM },
        { role: 'user',   content: userMessage },
      ],
    }),
    // Gemini 2.0 Flash — REST API 직접 호출 (SDK fetch 이슈 우회)
    (async () => {
      const apiKey = process.env.GEMINI_API_KEY ?? ''
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: QUERY_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      })
      if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`)
      const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '응답을 받지 못했습니다.'
    })(),
    // Claude Sonnet
    anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     QUERY_SYSTEM,
      messages:   [{ role: 'user', content: userMessage }],
    }),
  ])

  const chatgptAnswer = gptRes.status === 'fulfilled'
    ? (gptRes.value.choices[0]?.message?.content ?? '응답을 받지 못했습니다.')
    : `ChatGPT 호출 오류: ${gptRes.reason instanceof Error ? gptRes.reason.message : 'API 오류'}`

  const geminiAnswer = geminiRes.status === 'fulfilled'
    ? geminiRes.value
    : `Gemini 호출 오류: ${geminiRes.reason instanceof Error ? geminiRes.reason.message : 'API 오류'}`

  const claudeAnswer = claudeRes.status === 'fulfilled'
    ? (claudeRes.value.content[0].type === 'text' ? claudeRes.value.content[0].text : '응답을 받지 못했습니다.')
    : `Claude 호출 오류: ${claudeRes.reason instanceof Error ? claudeRes.reason.message : 'API 오류'}`

  // ── Claude로 3개 답변 종합 GEO 분석 (최대 3회 재시도) ────────────────────
  const analysisPrompt = `질문: "${query.trim()}"\n\n[ChatGPT (GPT-4o mini) 답변]\n${chatgptAnswer}\n\n[Gemini (2.0 Flash) 답변]\n${geminiAnswer}\n\n[Claude (Sonnet) 답변]\n${claudeAnswer}\n\n위 3개 AI 모델의 실제 답변을 종합 분석하여 GEO 분석 JSON을 반환해주세요.`

  let analysisResult: { brand_visibility: BrandVisibility[]; geo_insights: string[] } | null = null
  let lastError = ''

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const analysisMsg = await anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     ANALYSIS_SYSTEM,
        messages:   [{ role: 'user', content: analysisPrompt }],
      })

      const raw     = analysisMsg.content[0].type === 'text' ? analysisMsg.content[0].text : '{}'
      const cleaned = sanitizeGeoJson(raw)
      const parsed  = JSON.parse(cleaned) as { brand_visibility: BrandVisibility[]; geo_insights: string[] }

      if (!Array.isArray(parsed.brand_visibility) || !Array.isArray(parsed.geo_insights)) {
        throw new Error('brand_visibility 또는 geo_insights 필드 누락')
      }
      analysisResult = parsed
      break
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
      console.warn(`[geo/playground] GEO 분석 파싱 실패 (${attempt + 1}/3): ${lastError}`)
    }
  }

  if (!analysisResult) {
    console.error('[geo/playground] 3회 재시도 후 최종 실패:', lastError)
    return NextResponse.json({ error: `GEO 분석 실패: ${lastError}` }, { status: 500 })
  }

  const result: PlaygroundResult = {
    query:          query.trim(),
    perspective,
    model_chatgpt:  { name: 'ChatGPT (GPT-4o mini)', answer: chatgptAnswer },
    model_gemini:   { name: 'Gemini (2.0 Flash)',    answer: geminiAnswer },
    model_claude:   { name: 'Claude (Sonnet)',       answer: claudeAnswer },
    brand_visibility: analysisResult.brand_visibility,
    geo_insights:     analysisResult.geo_insights,
    generated_at:   new Date().toISOString(),
  }

  return NextResponse.json(result)
}
