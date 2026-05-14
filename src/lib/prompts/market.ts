// src/lib/prompts/market.ts
import type { MarketCategory, PriorityTier, MarketSourceType } from '@/types/database'

export interface RawArticle {
  title: string
  description: string
  url: string
  source_name: string
  published_at: string   // ISO 8601
  source_type: MarketSourceType
  thumbnail_url?: string
}

export interface ArticleAnalysis {
  credibility_score: number
  priority_tier: PriorityTier
  category: MarketCategory
  summary_ko: string
  key_insight: string
  tags: string[]
}

export const MARKET_SYSTEM_PROMPT = `당신은 뷰티·의료기기 마케팅 산업 전문 애널리스트입니다.
수집된 기사를 분석해 마케터에게 유용한 인사이트를 제공합니다.
반드시 JSON 배열만 출력하세요. 마크다운이나 설명 텍스트를 포함하지 마세요.`

export function buildArticleAnalysisPrompt(articles: RawArticle[]): string {
  const list = articles
    .map((a, i) =>
      `[${i}] 제목: ${a.title}\n출처: ${a.source_name}\n발행일: ${a.published_at}\n내용: ${(a.description ?? '').slice(0, 200)}`,
    )
    .join('\n\n')

  return `다음 ${articles.length}개 기사를 분석하여 아래 JSON 배열로 응답하세요.

채점 기준:
- source_credibility(30점): 공신력 있는 언론사·전문지 여부
- recency_score(25점): 오늘 기준 1일=25 / 3일=18 / 7일=12 / 그 이상=5
- relevance_score(30점): 뷰티·의료기기·에스테틱·마케팅 관련성
- novelty_score(15점): 신규 정보=15 / 반복·중복=5

priority_tier: 합계 80이상="top", 50-79="standard", 49이하="low"
category: "tech_ai"(기술·AI·규제) | "marketing_kol"(인플루언서·캠페인) | "events"(전시·행사) | "daily"(일반 시장 동향)

기사 목록:
${list}

JSON 배열만 출력 (기사 순서와 동일한 인덱스):
[{"credibility_score":0,"priority_tier":"low","category":"daily","summary_ko":"","key_insight":"","tags":[]}]`
}
