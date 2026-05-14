// src/app/api/some-content/claude-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/utils/supabase/server'
import { claude, MODEL_INSIGHT } from '@/lib/claude'
import {
  SOME_CONTENT_SYSTEM_PROMPT,
  buildInsightPrompt,
  buildCrossChannelPrompt,
  type InsightInput,
  type CrossChannelInput,
  type InsightOutput,
  type CrossChannelOutput,
} from '@/lib/prompts/some-content'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as InsightInput & CrossChannelInput & { keyword_id: string }
  const { keyword_id, keyword } = body
  if (!keyword_id || !keyword) return NextResponse.json({ error: 'keyword_id, keyword 필요' }, { status: 400 })

  const [insightRes, crossRes] = await Promise.allSettled([
    claude.messages.create({
      model: MODEL_INSIGHT,
      max_tokens: 1500,
      system: SOME_CONTENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildInsightPrompt(body as InsightInput) }],
    }),
    claude.messages.create({
      model: MODEL_INSIGHT,
      max_tokens: 1500,
      system: SOME_CONTENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildCrossChannelPrompt(body as CrossChannelInput) }],
    }),
  ])

  const parseText = <T>(res: PromiseSettledResult<Anthropic.Message>): T | null => {
    if (res.status !== 'fulfilled') return null
    try {
      const block = res.value.content[0]
      const text = block.type === 'text' ? block.text.trim() : ''
      return JSON.parse(text) as T
    } catch { return null }
  }

  const insightPayload = parseText<InsightOutput>(insightRes as PromiseSettledResult<Anthropic.Message>)
  const crossPayload = parseText<CrossChannelOutput>(crossRes as PromiseSettledResult<Anthropic.Message>)

  const insightMsg = insightRes.status === 'fulfilled' ? insightRes.value as Anthropic.Message : null
  const crossMsg = crossRes.status === 'fulfilled' ? crossRes.value as Anthropic.Message : null
  const totalTokens =
    (insightMsg ? insightMsg.usage.input_tokens + insightMsg.usage.output_tokens : 0) +
    (crossMsg ? crossMsg.usage.input_tokens + crossMsg.usage.output_tokens : 0)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  // 기존 캐시 삭제 후 신규 저장
  await supabase.from('sc_claude_insights').delete().eq('keyword_id', keyword_id)

  const rows = [
    insightPayload && { keyword_id, keyword, insight_type: 'comprehensive', payload: insightPayload, token_used: totalTokens, expires_at: expiresAt.toISOString() },
    crossPayload && { keyword_id, keyword, insight_type: 'cross_channel', payload: crossPayload, token_used: totalTokens, expires_at: expiresAt.toISOString() },
  ].filter(Boolean)

  if (rows.length) await supabase.from('sc_claude_insights').insert(rows)

  return NextResponse.json({
    insight: insightPayload,
    cross_channel: crossPayload,
    generated_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    tokens: totalTokens,
  })
}
