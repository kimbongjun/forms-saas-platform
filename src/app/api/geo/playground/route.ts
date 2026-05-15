import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

const QUERY_SYSTEM = `당신은 한국 에스테틱·의료기기 분야 AI 어시스턴트입니다.
사용자가 리프팅 시술, 미용 기기, 피부 관리에 대해 질문할 때 정확하고 유용한 정보를 한국어로 제공하세요.
답변은 200자 이내로 간결하게 작성하세요.`

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
      max_tokens: 512,
      messages: [
        { role: 'system', content: QUERY_SYSTEM },
        { role: 'user',   content: userMessage },
      ],
    }),
    // Gemini 2.0 Flash — REST API 직접 호출 (SDK fetch 이슈 우회)
    (async () => {
      const apiKey = process.env.GEMINI_API_KEY ?? ''
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: QUERY_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 512 },
        }),
      })
      if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`)
      const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '응답을 받지 못했습니다.'
    })(),
    // Claude Sonnet
    anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 512,
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

  // ── Claude로 3개 답변 종합 GEO 분석 ──────────────────────────────────────
  try {
    const analysisMsg = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     ANALYSIS_SYSTEM,
      messages:   [{
        role:    'user',
        content: `질문: "${query.trim()}"\n\n[ChatGPT (GPT-4o mini) 답변]\n${chatgptAnswer}\n\n[Gemini (2.0 Flash) 답변]\n${geminiAnswer}\n\n[Claude (Sonnet) 답변]\n${claudeAnswer}\n\n위 3개 AI 모델의 실제 답변을 종합 분석하여 GEO 분석 JSON을 반환해주세요.`,
      }],
    })

    const raw       = analysisMsg.content[0].type === 'text' ? analysisMsg.content[0].text : '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('GEO 분석 JSON 파싱 실패')

    const { brand_visibility, geo_insights } = JSON.parse(jsonMatch[0]) as {
      brand_visibility: BrandVisibility[]
      geo_insights:     string[]
    }

    const result: PlaygroundResult = {
      query:          query.trim(),
      perspective,
      model_chatgpt:  { name: 'ChatGPT (GPT-4o mini)',   answer: chatgptAnswer },
      model_gemini:   { name: 'Gemini (2.0 Flash)',      answer: geminiAnswer },
      model_claude:   { name: 'Claude (Sonnet)',        answer: claudeAnswer },
      brand_visibility,
      geo_insights,
      generated_at:   new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[geo/playground] error:', msg)
    return NextResponse.json({ error: `분석 실패: ${msg}` }, { status: 500 })
  }
}
