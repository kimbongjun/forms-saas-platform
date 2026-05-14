// src/lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.')
}

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30_000,
  maxRetries: 2,
})

/** 시장조사 배치 처리 — 속도·비용 최적 */
export const MODEL_BATCH = 'claude-haiku-4-5-20251001'

/** 썸콘텐츠 심층 인사이트 — 품질 최적 */
export const MODEL_INSIGHT = 'claude-sonnet-4-6'
