// src/lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** 시장조사 배치 처리 — 속도·비용 최적 */
export const MODEL_BATCH = 'claude-haiku-4-5-20251001'

/** 썸콘텐츠 심층 인사이트 — 품질 최적 */
export const MODEL_INSIGHT = 'claude-sonnet-4-6'
